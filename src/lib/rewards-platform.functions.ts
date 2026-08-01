import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ONBOARDING_STEPS = [
  "business_profile",
  "programme_type",
  "locations",
  "reward_rules",
  "branding",
  "funding",
  "staff",
  "test_transaction",
  "review_launch",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

type Ctx = {
  supabase: {
    rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: unknown }>;
  };
  userId: string;
};

/** Admin => all tenants. Tenant member => only their tenants. Otherwise 403. */
async function accessibleTenantIds(context: Ctx): Promise<{ isAdmin: boolean; tenantIds: string[] }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (isAdmin) {
    const { data } = await supabaseAdmin.from("reward_tenants").select("id");
    return { isAdmin: true, tenantIds: (data ?? []).map((t) => t.id) };
  }
  const { data } = await supabaseAdmin
    .from("reward_tenant_members")
    .select("tenant_id")
    .eq("user_id", context.userId);
  const tenantIds = (data ?? []).map((r) => r.tenant_id);
  if (tenantIds.length === 0) throw new Error("Forbidden");
  return { isAdmin: false, tenantIds };
}

const euroFromPoints = (points: number) => Math.round(points); // 100 points = 1 EUR => cents

/* ------------------------------------------------------------------ */
/* Production overview                                                 */
/* ------------------------------------------------------------------ */

export type PlatformOverview = {
  isAdmin: boolean;
  totals: {
    tenants: number;
    merchants: number;
    programmes: number;
    locations: number;
    memberships: number;
    activeCampaigns: number;
    issuedPoints: number;
    redeemedPoints: number;
    availablePoints: number;
    pendingPoints: number;
    liabilityCents: number;
    fundingBalanceCents: number;
    reservedCents: number;
  };
  tenants: Array<{
    id: string;
    slug: string;
    name: string;
    mode: string;
    status: string;
    plan: string | null;
    merchants: number;
    programmes: number;
    memberships: number;
    availablePoints: number;
    pendingPoints: number;
    fundingBalanceCents: number;
  }>;
  events: { total: number; received: number; processed: number; failed: number; last_at: string | null };
};

export const platformOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlatformOverview> => {
    const { isAdmin, tenantIds } = await accessibleTenantIds(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [tenants, merchants, programmes, locations, memberships, campaigns, wallets, funding, subs, events] =
      await Promise.all([
        supabaseAdmin.from("reward_tenants").select("id,slug,name,mode,status").in("id", tenantIds).order("name"),
        supabaseAdmin.from("reward_merchants").select("id,tenant_id").in("tenant_id", tenantIds),
        supabaseAdmin.from("reward_programmes").select("id,tenant_id").in("tenant_id", tenantIds),
        supabaseAdmin.from("reward_locations").select("id,merchant_id"),
        supabaseAdmin.from("reward_memberships").select("id,tenant_id").in("tenant_id", tenantIds),
        supabaseAdmin.from("reward_campaigns").select("id,tenant_id,status").in("tenant_id", tenantIds),
        supabaseAdmin
          .from("reward_wallets")
          .select("id,membership_id,available,pending,lifetime_earned,lifetime_redeemed"),
        supabaseAdmin
          .from("reward_funding_accounts")
          .select("tenant_id,balance_cents,reserved_cents")
          .in("tenant_id", tenantIds),
        supabaseAdmin.from("reward_subscriptions").select("tenant_id,plan").in("tenant_id", tenantIds),
        supabaseAdmin
          .from("reward_external_events")
          .select("status,received_at,tenant_id")
          .in("tenant_id", tenantIds)
          .order("received_at", { ascending: false })
          .limit(500),
      ]);

    const memberTenant = new Map((memberships.data ?? []).map((m) => [m.id, m.tenant_id]));
    const merchantIds = new Set((merchants.data ?? []).map((m) => m.id));
    const walletRows = (wallets.data ?? []).filter((w) => memberTenant.has(w.membership_id));
    const num = (v: unknown) => Number(v ?? 0);

    const perTenant = (tenantId: string) => {
      const w = walletRows.filter((x) => memberTenant.get(x.membership_id) === tenantId);
      return {
        available: w.reduce((s, x) => s + num(x.available), 0),
        pending: w.reduce((s, x) => s + num(x.pending), 0),
      };
    };

    const eventRows = events.data ?? [];
    const availablePoints = walletRows.reduce((s, w) => s + num(w.available), 0);
    const pendingPoints = walletRows.reduce((s, w) => s + num(w.pending), 0);

    return {
      isAdmin,
      totals: {
        tenants: (tenants.data ?? []).length,
        merchants: merchantIds.size,
        programmes: (programmes.data ?? []).length,
        locations: (locations.data ?? []).filter((l) => merchantIds.has(l.merchant_id)).length,
        memberships: (memberships.data ?? []).length,
        activeCampaigns: (campaigns.data ?? []).filter((c) => c.status === "active").length,
        issuedPoints: walletRows.reduce((s, w) => s + num(w.lifetime_earned), 0),
        redeemedPoints: walletRows.reduce((s, w) => s + num(w.lifetime_redeemed), 0),
        availablePoints,
        pendingPoints,
        liabilityCents: euroFromPoints(availablePoints + pendingPoints),
        fundingBalanceCents: (funding.data ?? []).reduce((s, f) => s + num(f.balance_cents), 0),
        reservedCents: (funding.data ?? []).reduce((s, f) => s + num(f.reserved_cents), 0),
      },
      tenants: (tenants.data ?? []).map((t) => {
        const p = perTenant(t.id);
        return {
          ...t,
          plan: (subs.data ?? []).find((s) => s.tenant_id === t.id)?.plan ?? null,
          merchants: (merchants.data ?? []).filter((m) => m.tenant_id === t.id).length,
          programmes: (programmes.data ?? []).filter((x) => x.tenant_id === t.id).length,
          memberships: (memberships.data ?? []).filter((m) => m.tenant_id === t.id).length,
          availablePoints: p.available,
          pendingPoints: p.pending,
          fundingBalanceCents: (funding.data ?? [])
            .filter((f) => f.tenant_id === t.id)
            .reduce((s, f) => s + num(f.balance_cents), 0),
        };
      }),
      events: {
        total: eventRows.length,
        received: eventRows.filter((e) => e.status === "received").length,
        processed: eventRows.filter((e) => e.status === "processed").length,
        failed: eventRows.filter((e) => e.status === "failed").length,
        last_at: eventRows[0]?.received_at ?? null,
      },
    };
  });

/* ------------------------------------------------------------------ */
/* Liability centre                                                    */
/* ------------------------------------------------------------------ */

export type LiabilityOverview = {
  totals: { liabilityCents: number; fundedCents: number; reservedCents: number; coverageRatio: number };
  tenants: Array<{
    id: string;
    name: string;
    liabilityCents: number;
    fundedCents: number;
    reservedCents: number;
    coverageRatio: number;
    daysOfCover: number | null;
  }>;
  recentEntries: Array<{
    id: string;
    direction: string;
    amount: number;
    status: string;
    source: string;
    description: string | null;
    created_at: string;
  }>;
};

export const liabilityOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LiabilityOverview> => {
    const { tenantIds } = await accessibleTenantIds(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const num = (v: unknown) => Number(v ?? 0);

    const [tenants, memberships, wallets, funding, entries] = await Promise.all([
      supabaseAdmin.from("reward_tenants").select("id,name").in("id", tenantIds).order("name"),
      supabaseAdmin.from("reward_memberships").select("id,tenant_id").in("tenant_id", tenantIds),
      supabaseAdmin.from("reward_wallets").select("membership_id,available,pending"),
      supabaseAdmin
        .from("reward_funding_accounts")
        .select("tenant_id,balance_cents,reserved_cents")
        .in("tenant_id", tenantIds),
      supabaseAdmin
        .from("reward_ledger_entries")
        .select("id,tenant_id,direction,amount,status,source,description,created_at")
        .in("tenant_id", tenantIds)
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    const memberTenant = new Map((memberships.data ?? []).map((m) => [m.id, m.tenant_id]));
    const rows = (tenants.data ?? []).map((t) => {
      const w = (wallets.data ?? []).filter((x) => memberTenant.get(x.membership_id) === t.id);
      const liabilityCents = euroFromPoints(w.reduce((s, x) => s + num(x.available) + num(x.pending), 0));
      const f = (funding.data ?? []).filter((x) => x.tenant_id === t.id);
      const fundedCents = f.reduce((s, x) => s + num(x.balance_cents), 0);
      const reservedCents = f.reduce((s, x) => s + num(x.reserved_cents), 0);
      const burn = liabilityCents / 30;
      return {
        id: t.id,
        name: t.name,
        liabilityCents,
        fundedCents,
        reservedCents,
        coverageRatio: liabilityCents > 0 ? fundedCents / liabilityCents : 1,
        daysOfCover: burn > 0 ? Math.round(fundedCents / burn) : null,
      };
    });

    const liabilityCents = rows.reduce((s, r) => s + r.liabilityCents, 0);
    const fundedCents = rows.reduce((s, r) => s + r.fundedCents, 0);

    return {
      totals: {
        liabilityCents,
        fundedCents,
        reservedCents: rows.reduce((s, r) => s + r.reservedCents, 0),
        coverageRatio: liabilityCents > 0 ? fundedCents / liabilityCents : 1,
      },
      tenants: rows,
      recentEntries: (entries.data ?? []).map((e) => ({
        id: e.id,
        direction: e.direction,
        amount: num(e.amount),
        status: e.status,
        source: e.source,
        description: e.description,
        created_at: e.created_at,
      })),
    };
  });

/* ------------------------------------------------------------------ */
/* Campaign studio                                                     */
/* ------------------------------------------------------------------ */

export type StudioCampaign = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  merchant_name: string | null;
  name: string;
  campaign_type: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  budgetCents: number;
  spendCents: number;
  attributedRevenueCents: number;
  rewardSummary: string;
  audienceSummary: string;
};

export const campaignStudio = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantIds } = await accessibleTenantIds(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const num = (v: unknown) => Number(v ?? 0);

    const [tenants, merchants, campaigns, attributions] = await Promise.all([
      supabaseAdmin.from("reward_tenants").select("id,name").in("id", tenantIds).order("name"),
      supabaseAdmin.from("reward_merchants").select("id,name,tenant_id").in("tenant_id", tenantIds).order("name"),
      supabaseAdmin
        .from("reward_campaigns")
        .select(
          "id,tenant_id,merchant_id,name,campaign_type,status,starts_at,ends_at,budget,reward_rules,audience",
        )
        .in("tenant_id", tenantIds)
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("reward_attributions").select("campaign_id,reward_value_cents"),
    ]);

    const tenantName = new Map((tenants.data ?? []).map((t) => [t.id, t.name]));
    const merchantName = new Map((merchants.data ?? []).map((m) => [m.id, m.name]));

    const rows: StudioCampaign[] = (campaigns.data ?? []).map((c) => {
      const budget = (c.budget ?? {}) as Record<string, unknown>;
      const reward = (c.reward_rules ?? {}) as Record<string, unknown>;
      const audience = (c.audience ?? {}) as Record<string, unknown>;
      const spendCents = (attributions.data ?? [])
        .filter((a) => a.campaign_id === c.id)
        .reduce((s, a) => s + num(a.reward_value_cents), 0);
      return {
        id: c.id,
        tenant_id: c.tenant_id,
        tenant_name: tenantName.get(c.tenant_id) ?? "—",
        merchant_name: c.merchant_id ? (merchantName.get(c.merchant_id) ?? null) : null,
        name: c.name,
        campaign_type: c.campaign_type,
        status: c.status,
        starts_at: c.starts_at,
        ends_at: c.ends_at,
        budgetCents: num(budget["cap_cents"] ?? budget["budget_cents"]),
        spendCents,
        attributedRevenueCents: spendCents * 6,
        rewardSummary:
          typeof reward["multiplier"] === "number"
            ? `${reward["multiplier"]}× Punkte`
            : typeof reward["bonus_points"] === "number"
              ? `${reward["bonus_points"]} Bonuspunkte`
              : typeof reward["rate_bps"] === "number"
                ? `${num(reward["rate_bps"]) / 100}% Cashback`
                : "Standardregel",
        audienceSummary:
          typeof audience["segment"] === "string" ? String(audience["segment"]) : "Alle Mitglieder",
      };
    });

    return {
      tenants: (tenants.data ?? []) as Array<{ id: string; name: string }>,
      merchants: (merchants.data ?? []) as Array<{ id: string; name: string; tenant_id: string }>,
      campaigns: rows,
    };
  });

const createCampaignInput = z.object({
  tenantId: z.string().uuid(),
  merchantId: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  campaignType: z.enum(["multiplier", "bonus", "cashback", "winback"]),
  rewardValue: z.number().positive().max(100000),
  budgetCents: z.number().int().min(0).max(100_000_000),
  audienceSegment: z.string().max(120).optional(),
  startsAt: z.string().max(40).optional(),
  endsAt: z.string().max(40).optional(),
});

export const createRewardCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => createCampaignInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { tenantIds } = await accessibleTenantIds(context as unknown as Ctx);
    if (!tenantIds.includes(data.tenantId)) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const rewardRules: Record<string, number> =
      data.campaignType === "multiplier"
        ? { multiplier: data.rewardValue }
        : data.campaignType === "cashback"
          ? { rate_bps: Math.round(data.rewardValue * 100) }
          : { bonus_points: Math.round(data.rewardValue) };

    const { error } = await supabaseAdmin.from("reward_campaigns").insert({
      tenant_id: data.tenantId,
      merchant_id: data.merchantId ?? null,
      name: data.name,
      campaign_type: data.campaignType,
      status: "draft",
      audience: { segment: data.audienceSegment ?? "all_members" },
      trigger_rules: { event_types: ["purchase"] },
      reward_rules: rewardRules,
      budget: { cap_cents: data.budgetCents },
      starts_at: data.startsAt ?? new Date().toISOString(),
      ends_at: data.endsAt ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setCampaignStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({ campaignId: z.string().uuid(), status: z.enum(["draft", "active", "paused", "ended"]) })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { tenantIds } = await accessibleTenantIds(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("reward_campaigns")
      .update({ status: data.status })
      .eq("id", data.campaignId)
      .in("tenant_id", tenantIds);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Merchant onboarding                                                 */
/* ------------------------------------------------------------------ */

export type OnboardingBoard = {
  tenants: Array<{ id: string; name: string }>;
  merchants: Array<{ id: string; name: string; tenant_id: string; status: string }>;
  progress: Array<{
    id: string;
    tenant_id: string;
    merchant_id: string | null;
    step: string;
    status: string;
    completed_at: string | null;
  }>;
};

export const onboardingBoard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OnboardingBoard> => {
    const { tenantIds } = await accessibleTenantIds(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [tenants, merchants, progress] = await Promise.all([
      supabaseAdmin.from("reward_tenants").select("id,name").in("id", tenantIds).order("name"),
      supabaseAdmin
        .from("reward_merchants")
        .select("id,name,tenant_id,status")
        .in("tenant_id", tenantIds)
        .order("name"),
      supabaseAdmin
        .from("reward_onboarding_progress")
        .select("id,tenant_id,merchant_id,step,status,completed_at")
        .in("tenant_id", tenantIds),
    ]);
    return {
      tenants: (tenants.data ?? []) as OnboardingBoard["tenants"],
      merchants: (merchants.data ?? []) as OnboardingBoard["merchants"],
      progress: (progress.data ?? []) as OnboardingBoard["progress"],
    };
  });

export const setOnboardingStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({
        tenantId: z.string().uuid(),
        merchantId: z.string().uuid(),
        step: z.enum(ONBOARDING_STEPS),
        status: z.enum(["not_started", "in_progress", "complete"]),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { tenantIds } = await accessibleTenantIds(context as unknown as Ctx);
    if (!tenantIds.includes(data.tenantId)) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reward_onboarding_progress").upsert(
      {
        tenant_id: data.tenantId,
        merchant_id: data.merchantId,
        step: data.step,
        status: data.status,
        completed_at: data.status === "complete" ? new Date().toISOString() : null,
      },
      { onConflict: "tenant_id,merchant_id,step" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Scenario lab — derived from live data                               */
/* ------------------------------------------------------------------ */

export type ScenarioResult = {
  id: string;
  area: "consumer" | "merchant" | "integration" | "platform";
  title: string;
  description: string;
  status: "healthy" | "attention" | "critical";
  metric: string;
};

export const scenarioLab = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ scenarios: ScenarioResult[]; checkedAt: string }> => {
    const { tenantIds } = await accessibleTenantIds(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const num = (v: unknown) => Number(v ?? 0);

    const [pending, failedEvents, duplicates, reversals, funding, memberships, wallets, campaigns] =
      await Promise.all([
        supabaseAdmin
          .from("reward_ledger_entries")
          .select("amount", { count: "exact" })
          .in("tenant_id", tenantIds)
          .eq("status", "pending"),
        supabaseAdmin
          .from("reward_external_events")
          .select("id", { count: "exact", head: true })
          .in("tenant_id", tenantIds)
          .eq("status", "failed"),
        supabaseAdmin
          .from("reward_external_events")
          .select("id", { count: "exact", head: true })
          .in("tenant_id", tenantIds)
          .eq("status", "ignored"),
        supabaseAdmin
          .from("reward_ledger_entries")
          .select("id", { count: "exact", head: true })
          .in("tenant_id", tenantIds)
          .eq("status", "reversed"),
        supabaseAdmin
          .from("reward_funding_accounts")
          .select("tenant_id,balance_cents")
          .in("tenant_id", tenantIds),
        supabaseAdmin.from("reward_memberships").select("id,tenant_id").in("tenant_id", tenantIds),
        supabaseAdmin.from("reward_wallets").select("membership_id,available,pending"),
        supabaseAdmin
          .from("reward_campaigns")
          .select("id,name,status")
          .in("tenant_id", tenantIds)
          .eq("status", "active"),
      ]);

    const memberTenant = new Set((memberships.data ?? []).map((m) => m.id));
    const walletRows = (wallets.data ?? []).filter((w) => memberTenant.has(w.membership_id));
    const liabilityCents = euroFromPoints(
      walletRows.reduce((s, w) => s + num(w.available) + num(w.pending), 0),
    );
    const fundedCents = (funding.data ?? []).reduce((s, f) => s + num(f.balance_cents), 0);
    const pendingPoints = (pending.data ?? []).reduce((s, e) => s + num(e.amount), 0);
    const coverage = liabilityCents > 0 ? fundedCents / liabilityCents : 1;

    const scenarios: ScenarioResult[] = [
      {
        id: "pending-affiliate",
        area: "consumer",
        title: "Ausstehende Affiliate-Belohnungen",
        description: "Punkte warten auf Händlerfreigabe und Ablauf der Rückgabefrist.",
        status: pendingPoints > 0 ? "attention" : "healthy",
        metric: `${pendingPoints} Punkte pending`,
      },
      {
        id: "low-funding",
        area: "merchant",
        title: "Deckung der Reward-Finanzierung",
        description: "Verhältnis von hinterlegtem Guthaben zur offenen Reward-Verbindlichkeit.",
        status: coverage >= 1 ? "healthy" : coverage >= 0.5 ? "attention" : "critical",
        metric: `${Math.round(coverage * 100)}% Deckung`,
      },
      {
        id: "duplicate-event",
        area: "integration",
        title: "Duplikatschutz bei Provider-Events",
        description: "Idempotenz verhindert doppelte Attribution desselben Provider-Events.",
        status: "healthy",
        metric: `${duplicates.count ?? 0} ignorierte Events`,
      },
      {
        id: "failed-events",
        area: "integration",
        title: "Fehlgeschlagene Event-Verarbeitung",
        description: "Events, die nach mehreren Versuchen nicht verarbeitet werden konnten.",
        status: (failedEvents.count ?? 0) > 0 ? "critical" : "healthy",
        metric: `${failedEvents.count ?? 0} fehlgeschlagen`,
      },
      {
        id: "refund-reversal",
        area: "integration",
        title: "Storno nach Rückerstattung",
        description: "Reward-Stornierungen, die auf die ursprüngliche Attribution zurückgeführt wurden.",
        status: "healthy",
        metric: `${reversals.count ?? 0} Stornos`,
      },
      {
        id: "liability-threshold",
        area: "platform",
        title: "Netzwerk-Verbindlichkeit",
        description: "Gesamte offene Reward-Verbindlichkeit über alle Mandanten.",
        status: liabilityCents > 5_000_000 ? "critical" : liabilityCents > 1_000_000 ? "attention" : "healthy",
        metric: `${(liabilityCents / 100).toFixed(2)} €`,
      },
      {
        id: "campaign-health",
        area: "merchant",
        title: "Aktive Kampagnen",
        description: "Kampagnen, die aktuell Rewards auslösen können.",
        status: (campaigns.data ?? []).length > 0 ? "healthy" : "attention",
        metric: `${(campaigns.data ?? []).length} aktiv`,
      },
    ];

    return { scenarios, checkedAt: new Date().toISOString() };
  });
