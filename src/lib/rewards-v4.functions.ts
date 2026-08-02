import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ------------------------------------------------------------------ */
/* Overview (wallet + campaigns + security)                            */
/* ------------------------------------------------------------------ */

export type RewardsV4Overview = {
  isAdmin: boolean;
  tenants: Array<{ id: string; name: string }>;
  wallet: {
    availablePoints: number;
    pendingPoints: number;
    lifetimeEarned: number;
    lifetimeRedeemed: number;
    cashbackCents: number;
    giftCreditCents: number;
    merchantPoints: Array<{ label: string; points: number }>;
  };
  activity: Array<{
    id: string;
    label: string;
    description: string | null;
    points: number;
    status: string;
    source: string;
    occurredAt: string;
  }>;
  breakdown: Array<{ source: string; points: number }>;
  campaigns: Array<{
    id: string;
    name: string;
    goal: string;
    status: string;
    budgetCents: number;
    spentCents: number;
    attributedRevenueCents: number;
  }>;
  automations: Array<{ id: string; name: string; triggerType: string; status: string }>;
  segments: Array<{ id: string; name: string; description: string | null; members: number }>;
  securityEvents: Array<{
    id: string;
    eventType: string;
    severity: string;
    status: string;
    riskScore: number;
    reasons: string[];
    createdAt: string;
  }>;
  stampCards: Array<{
    id: string;
    programme: string;
    current: number;
    required: number;
    reward: string;
  }>;
};

export const getRewardsV4Overview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RewardsV4Overview> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context;

    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    const { data: memberRows } = await supabaseAdmin
      .from("reward_tenant_members")
      .select("tenant_id")
      .eq("user_id", userId);
    let tenantIds = (memberRows ?? []).map((r) => r.tenant_id);
    if (isAdmin) {
      const { data } = await supabaseAdmin.from("reward_tenants").select("id");
      tenantIds = (data ?? []).map((t) => t.id);
    }

    const { data: tenants } = await supabaseAdmin
      .from("reward_tenants")
      .select("id, name")
      .in("id", tenantIds.length ? tenantIds : ["00000000-0000-0000-0000-000000000000"]);

    // Wallet: memberships owned by the caller across tenants.
    const { data: memberships } = await supabaseAdmin
      .from("reward_memberships")
      .select("id")
      .eq("platform_user_id", userId);
    const membershipIds = (memberships ?? []).map((m) => m.id);

    const { data: wallets } = membershipIds.length
      ? await supabaseAdmin
          .from("reward_wallets")
          .select(
            "id, available, pending, lifetime_earned, lifetime_redeemed, reward_programmes(name, currency)",
          )
          .in("membership_id", membershipIds)
      : { data: [] as never[] };

    const walletList = (wallets ?? []) as Array<{
      id: string;
      available: number;
      pending: number;
      lifetime_earned: number;
      lifetime_redeemed: number;
      reward_programmes: { name: string; currency: string } | null;
    }>;

    const sum = (fn: (w: (typeof walletList)[number]) => number) =>
      walletList.reduce((acc, w) => acc + Number(fn(w) ?? 0), 0);

    const byCurrency = (currency: string) =>
      walletList
        .filter((w) => w.reward_programmes?.currency === currency)
        .reduce((acc, w) => acc + Number(w.available ?? 0), 0);

    const walletIds = walletList.map((w) => w.id);
    const { data: entries } = walletIds.length
      ? await supabaseAdmin
          .from("reward_ledger_entries")
          .select("id, direction, amount, status, source, description, created_at")
          .in("wallet_id", walletIds)
          .order("created_at", { ascending: false })
          .limit(25)
      : { data: [] as never[] };

    const activity = (entries ?? []).map((e) => ({
      id: e.id,
      label: e.source.replace(/_/g, " "),
      description: e.description,
      points: (e.direction === "credit" ? 1 : -1) * Number(e.amount ?? 0),
      status: e.status,
      source: e.source,
      occurredAt: e.created_at,
    }));

    const breakdownMap = new Map<string, number>();
    for (const a of activity) {
      breakdownMap.set(a.source, (breakdownMap.get(a.source) ?? 0) + Math.abs(a.points));
    }

    const scoped = tenantIds.length ? tenantIds : ["00000000-0000-0000-0000-000000000000"];

    const [campaignRows, attributions, automationRows, segmentRows, securityRows, stampRows] =
      await Promise.all([
        supabaseAdmin
          .from("reward_campaigns")
          .select("id, name, campaign_type, status, budget")
          .in("tenant_id", scoped)
          .order("created_at", { ascending: false })
          .limit(12),
        supabaseAdmin.from("reward_attributions").select("campaign_id, reward_value_cents"),
        supabaseAdmin
          .from("zr_automations")
          .select("id, name, trigger_type, status")
          .in("tenant_id", scoped),
        supabaseAdmin
          .from("zr_customer_segments")
          .select("id, name, description, estimated_members")
          .in("tenant_id", scoped),
        supabaseAdmin
          .from("zr_security_events")
          .select("id, event_type, severity, status, risk_score, reasons, created_at")
          .in("tenant_id", scoped)
          .order("created_at", { ascending: false })
          .limit(20),
        supabaseAdmin
          .from("zr_stamp_cards")
          .select("id, programme_name, current_stamps, stamps_required, reward_description")
          .in("tenant_id", scoped)
          .limit(10),
      ]);

    const spendByCampaign = new Map<string, number>();
    for (const a of attributions.data ?? []) {
      if (!a.campaign_id) continue;
      spendByCampaign.set(
        a.campaign_id,
        (spendByCampaign.get(a.campaign_id) ?? 0) + Number(a.reward_value_cents ?? 0),
      );
    }

    return {
      isAdmin: Boolean(isAdmin),
      tenants: (tenants ?? []).map((t) => ({ id: t.id, name: t.name })),
      wallet: {
        availablePoints: byCurrency("universal_points"),
        pendingPoints: sum((w) => Number(w.pending)),
        lifetimeEarned: sum((w) => Number(w.lifetime_earned)),
        lifetimeRedeemed: sum((w) => Number(w.lifetime_redeemed)),
        cashbackCents: byCurrency("cashback_cents"),
        giftCreditCents: byCurrency("gift_credit_cents"),
        merchantPoints: walletList
          .filter((w) => w.reward_programmes?.currency === "merchant_points")
          .map((w) => ({
            label: w.reward_programmes?.name ?? "Merchant points",
            points: Number(w.available ?? 0),
          })),
      },
      activity,
      breakdown: Array.from(breakdownMap, ([source, points]) => ({ source, points })).sort(
        (a, b) => b.points - a.points,
      ),
      campaigns: (campaignRows.data ?? []).map((c) => {
        const budget = (c.budget ?? {}) as { cap_cents?: number; revenue_cents?: number };
        return {
          id: c.id,
          name: c.name,
          goal: c.campaign_type,
          status: c.status,
          budgetCents: Number(budget.cap_cents ?? 0),
          spentCents: spendByCampaign.get(c.id) ?? 0,
          attributedRevenueCents: Number(budget.revenue_cents ?? 0),
        };
      }),
      automations: (automationRows.data ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        triggerType: a.trigger_type,
        status: a.status,
      })),
      segments: (segmentRows.data ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        members: s.estimated_members,
      })),
      securityEvents: (securityRows.data ?? []).map((e) => ({
        id: e.id,
        eventType: e.event_type,
        severity: e.severity,
        status: e.status,
        riskScore: e.risk_score,
        reasons: Array.isArray(e.reasons) ? (e.reasons as string[]) : [],
        createdAt: e.created_at,
      })),
      stampCards: (stampRows.data ?? []).map((s) => ({
        id: s.id,
        programme: s.programme_name,
        current: s.current_stamps,
        required: s.stamps_required,
        reward: s.reward_description,
      })),
    };
  });

/* ------------------------------------------------------------------ */
/* Secure reward action (server-only, role validated, idempotent)      */
/* ------------------------------------------------------------------ */

const rewardActionInput = z.object({
  action: z.enum(["earn", "redeem", "reverse", "gift_card_issue", "stamp_award"]),
  tenantId: z.string().uuid(),
  walletId: z.string().uuid().optional(),
  stampCardId: z.string().uuid().optional(),
  amount: z.number().int().positive().max(10_000_000),
  idempotencyKey: z.string().min(12).max(128),
  description: z.string().max(280).optional(),
});

const STAFF_ROLES = ["owner", "admin", "finance_manager", "manager", "cashier"];

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const executeRewardAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => rewardActionInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Authorisation: platform admin or active tenant staff.
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) {
      const { data: member } = await supabaseAdmin
        .from("reward_tenant_members")
        .select("role")
        .eq("tenant_id", data.tenantId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (!member) throw new Error("Forbidden: not a member of this tenant.");
      if (!STAFF_ROLES.includes(member.role)) throw new Error("Forbidden: insufficient role.");
    }

    // Idempotency: never post the same reference twice.
    const { data: existing } = await supabaseAdmin
      .from("reward_ledger_entries")
      .select("id")
      .eq("source_reference", data.idempotencyKey)
      .maybeSingle();
    if (existing) return { ok: true, duplicate: true, entryId: existing.id };

    if (data.action === "stamp_award") {
      if (!data.stampCardId) throw new Error("stampCardId is required for stamp_award.");
      const { data: card, error } = await supabaseAdmin
        .from("zr_stamp_cards")
        .select("id, current_stamps, stamps_required, completed_count, tenant_id")
        .eq("id", data.stampCardId)
        .eq("tenant_id", data.tenantId)
        .maybeSingle();
      if (error || !card) throw new Error("Stamp card not found.");
      let current = card.current_stamps + data.amount;
      let completed = card.completed_count;
      while (current >= card.stamps_required) {
        current -= card.stamps_required;
        completed += 1;
      }
      await supabaseAdmin
        .from("zr_stamp_cards")
        .update({ current_stamps: current, completed_count: completed })
        .eq("id", card.id);
      return { ok: true, duplicate: false, stamps: current, completed };
    }

    if (data.action === "gift_card_issue") {
      const code = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
      const { data: card, error } = await supabaseAdmin
        .from("zr_gift_cards_v4")
        .insert({
          tenant_id: data.tenantId,
          code_hash: await sha256(code),
          initial_value_cents: data.amount,
          remaining_value_cents: data.amount,
          purchaser_user_id: context.userId,
          status: "active",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { ok: true, duplicate: false, giftCardId: card.id, code };
    }

    if (!data.walletId) throw new Error("walletId is required for ledger actions.");
    const direction = data.action === "earn" ? "credit" : "debit";
    const { data: entryId, error } = await supabaseAdmin.rpc("reward_post_entry", {
      p_wallet_id: data.walletId,
      p_direction: direction,
      p_amount: data.amount,
      p_status: data.action === "reverse" ? "reversed" : "available",
      p_source: "manual",
      p_reference: data.idempotencyKey,
      p_description: data.description ?? `v4 ${data.action}`,
      p_metadata: { actor: context.userId, action: data.action },
    });
    if (error) throw new Error(error.message);
    return { ok: true, duplicate: false, entryId: entryId as string };
  });
