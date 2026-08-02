import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ------------------------------------------------------------------ */
/* Go-live readiness overview                                          */
/* ------------------------------------------------------------------ */

export type GoLiveOverview = {
  tenants: Array<{ id: string; name: string }>;
  tenantId: string | null;
  onboarding: {
    status: string;
    requiredActions: string[];
    legalName: string | null;
    submittedAt: string | null;
  } | null;
  liability: {
    universalPointsMinor: number;
    merchantPointsMinor: number;
    pendingPointsMinor: number;
    cashbackMinor: number;
    giftCreditMinor: number;
    redemptionPayableMinor: number;
    fundingAvailableMinor: number;
    calculatedAt: string;
  } | null;
  alerts: Array<{
    id: string;
    severity: "info" | "warning" | "critical";
    alertType: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
};

export const getGoLiveOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({ tenantId: z.string().uuid().optional() })
      .default({})
      .parse(raw ?? {}),
  )
  .handler(async ({ data, context }): Promise<GoLiveOverview> => {
    const { supabase } = context;

    const { data: tenantRows } = await supabase.from("reward_tenants").select("id, name");
    const tenants = (tenantRows ?? []).map((t) => ({ id: t.id, name: t.name }));
    const tenantId = data.tenantId ?? tenants[0]?.id ?? null;

    if (!tenantId) {
      return { tenants, tenantId: null, onboarding: null, liability: null, alerts: [] };
    }

    const [onboarding, liability, alerts] = await Promise.all([
      supabase
        .from("zr_merchant_onboarding_cases")
        .select("status, required_actions, legal_name, submitted_at")
        .eq("tenant_id", tenantId)
        .maybeSingle(),
      supabase
        .from("zr_liability_snapshots")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("zr_operational_alerts")
        .select("id, severity, alert_type, title, status, created_at")
        .eq("tenant_id", tenantId)
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    const snapshot = liability.data;

    return {
      tenants,
      tenantId,
      onboarding: onboarding.data
        ? {
            status: onboarding.data.status,
            requiredActions: Array.isArray(onboarding.data.required_actions)
              ? (onboarding.data.required_actions as string[])
              : [],
            legalName: onboarding.data.legal_name,
            submittedAt: onboarding.data.submitted_at,
          }
        : null,
      liability: snapshot
        ? {
            universalPointsMinor: Number(snapshot.universal_points_minor ?? 0),
            merchantPointsMinor: Number(snapshot.merchant_points_minor ?? 0),
            pendingPointsMinor: Number(snapshot.pending_points_minor ?? 0),
            cashbackMinor: Number(snapshot.cashback_minor ?? 0),
            giftCreditMinor: Number(snapshot.gift_credit_minor ?? 0),
            redemptionPayableMinor: Number(snapshot.redemption_payable_minor ?? 0),
            fundingAvailableMinor: Number(snapshot.funding_available_minor ?? 0),
            calculatedAt: snapshot.calculated_at,
          }
        : null,
      alerts: (alerts.data ?? []).map((a) => ({
        id: a.id,
        severity: a.severity as "info" | "warning" | "critical",
        alertType: a.alert_type,
        title: a.title,
        status: a.status,
        createdAt: a.created_at,
      })),
    };
  });

/* ------------------------------------------------------------------ */
/* Secure reward action (atomic, balanced, idempotent)                 */
/* ------------------------------------------------------------------ */

const STAFF_ROLES = ["owner", "admin", "platform_admin", "finance_manager", "manager", "cashier"];

const ledgerEntry = z.object({
  wallet_id: z.string().uuid(),
  direction: z.enum(["credit", "debit"]),
  amount: z.number().int().positive().max(10_000_000),
  status: z.enum(["pending", "available", "reversed"]).optional(),
  description: z.string().max(280).optional(),
});

const rewardActionInput = z.object({
  tenantId: z.string().uuid(),
  transactionType: z.enum(["earn", "redeem", "reverse"]),
  idempotencyKey: z.string().min(12).max(128),
  entries: z.array(ledgerEntry).min(2).max(10),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

async function assertTenantStaff(
  context: { supabase: { rpc: (fn: string, args: unknown) => Promise<{ data: unknown }> } },
  userId: string,
  tenantId: string,
) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (isAdmin) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: member } = await supabaseAdmin
    .from("reward_tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!member) throw new Error("Forbidden: not a member of this tenant.");
  if (!STAFF_ROLES.includes(member.role)) throw new Error("Forbidden: insufficient role.");
}

export const secureRewardAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => rewardActionInput.parse(raw))
  .handler(async ({ data, context }) => {
    await assertTenantStaff(context, context.userId, data.tenantId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: result, error } = await supabaseAdmin.rpc("zr_execute_reward_action", {
      p_tenant_id: data.tenantId,
      p_actor: context.userId,
      p_transaction_type: data.transactionType,
      p_idempotency_key: data.idempotencyKey,
      p_entries: data.entries,
      p_metadata: data.metadata ?? {},
    });
    if (error) throw new Error(error.message);
    return result as { ok: boolean; duplicate: boolean; entry_ids: string[] };
  });

/* ------------------------------------------------------------------ */
/* Secure QR: signed 60-second single-use tokens                       */
/* ------------------------------------------------------------------ */

async function hmacHex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function qrSecret(): string {
  const secret = process.env["REWARDS_QR_SIGNING_SECRET"] ?? process.env["REWARDS_INGEST_SECRET"];
  if (!secret) throw new Error("QR signing secret is not configured.");
  return secret;
}

const QR_TTL_SECONDS = 60;

export const issueSecureQr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({
        tenantId: z.string().uuid(),
        actionType: z.enum(["earn", "redeem"]),
        memberId: z.string().uuid().optional(),
        merchantId: z.string().uuid().optional(),
        locationId: z.string().uuid().optional(),
        amountCents: z.number().int().positive().max(100_000_000),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertTenantStaff(context, context.userId, data.tenantId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const nonce = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + QR_TTL_SECONDS * 1000).toISOString();
    const payload = [
      data.tenantId,
      data.actionType,
      data.merchantId ?? "",
      data.memberId ?? "",
      data.amountCents,
      nonce,
      expiresAt,
    ].join("|");
    const signature = await hmacHex(qrSecret(), payload);
    const token = `${nonce}.${signature}`;
    const tokenHash = await hmacHex(qrSecret(), token);

    const { data: id, error } = await supabaseAdmin.rpc("zr_qr_issue", {
      p_tenant_id: data.tenantId,
      p_action_type: data.actionType,
      p_token_hash: tokenHash,
      p_nonce: nonce,
      p_member_id: data.memberId ?? null,
      p_merchant_id: data.merchantId ?? null,
      p_location_id: data.locationId ?? null,
      p_amount_cents: data.amountCents,
      p_ttl_seconds: QR_TTL_SECONDS,
    });
    if (error) throw new Error(error.message);
    return { challengeId: id as string, token, expiresAt };
  });

export const consumeSecureQr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ token: z.string().min(16).max(400) }).parse(raw))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tokenHash = await hmacHex(qrSecret(), data.token);
    const { data: result, error } = await supabaseAdmin.rpc("zr_qr_consume", {
      p_token_hash: tokenHash,
    });
    if (error) throw new Error(error.message);
    return result as { ok: boolean; reason?: string; challenge_id?: string };
  });
