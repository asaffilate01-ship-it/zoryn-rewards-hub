import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const tenantInput = (raw: unknown) =>
  z
    .object({ tenantId: z.string().uuid().optional() })
    .default({})
    .parse(raw ?? {});

export type BillingPlan = {
  id: string;
  code: string;
  name: string;
  monthlyPriceMinor: number;
  annualPriceMinor: number;
  locationLimit: number | null;
  staffLimit: number | null;
  campaignLimit: number | null;
  apiRequestLimit: number | null;
  whiteLabelEnabled: boolean;
};

export type BillingOverview = {
  tenants: Array<{ id: string; name: string }>;
  tenantId: string | null;
  plans: BillingPlan[];
  subscription: {
    planId: string;
    status: string;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
};

export const getBillingOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(tenantInput)
  .handler(async ({ data, context }): Promise<BillingOverview> => {
    const { supabase } = context;

    const { data: tenantRows } = await supabase.from("reward_tenants").select("id, name");
    const tenants = (tenantRows ?? []).map((t) => ({ id: t.id, name: t.name }));
    const tenantId = data.tenantId ?? tenants[0]?.id ?? null;

    const { data: planRows } = await supabase
      .from("zr_billing_plans")
      .select("*")
      .eq("active", true)
      .order("monthly_price_minor", { ascending: true });

    const plans: BillingPlan[] = (planRows ?? []).map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      monthlyPriceMinor: Number(p.monthly_price_minor ?? 0),
      annualPriceMinor: Number(p.annual_price_minor ?? 0),
      locationLimit: p.location_limit,
      staffLimit: p.staff_limit,
      campaignLimit: p.campaign_limit,
      apiRequestLimit: p.api_request_limit,
      whiteLabelEnabled: p.white_label_enabled,
    }));

    if (!tenantId) return { tenants, tenantId: null, plans, subscription: null };

    const { data: sub } = await supabase
      .from("zr_subscriptions_v2")
      .select("plan_id, status, trial_ends_at, current_period_end, cancel_at_period_end")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    return {
      tenants,
      tenantId,
      plans,
      subscription: sub
        ? {
            planId: sub.plan_id,
            status: sub.status,
            trialEndsAt: sub.trial_ends_at,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          }
        : null,
    };
  });

export type ReconciliationRun = {
  id: string;
  runType: string;
  status: string;
  expectedMinor: number;
  actualMinor: number;
  differenceMinor: number;
  startedAt: string;
  completedAt: string | null;
};

export type ReconciliationOverview = {
  tenants: Array<{ id: string; name: string }>;
  tenantId: string | null;
  runs: ReconciliationRun[];
};

export const getReconciliationOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(tenantInput)
  .handler(async ({ data, context }): Promise<ReconciliationOverview> => {
    const { supabase } = context;

    const { data: tenantRows } = await supabase.from("reward_tenants").select("id, name");
    const tenants = (tenantRows ?? []).map((t) => ({ id: t.id, name: t.name }));
    const tenantId = data.tenantId ?? tenants[0]?.id ?? null;

    if (!tenantId) return { tenants, tenantId: null, runs: [] };

    const { data: rows } = await supabase
      .from("zr_reconciliation_runs")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("started_at", { ascending: false })
      .limit(30);

    return {
      tenants,
      tenantId,
      runs: (rows ?? []).map((r) => ({
        id: r.id,
        runType: r.run_type,
        status: r.status,
        expectedMinor: Number(r.expected_minor ?? 0),
        actualMinor: Number(r.actual_minor ?? 0),
        differenceMinor: Number(r.difference_minor ?? 0),
        startedAt: r.started_at,
        completedAt: r.completed_at,
      })),
    };
  });

/** Reverse a posted reward transaction atomically (idempotent). */
export const reverseRewardTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({
        tenantId: z.string().uuid(),
        originalReference: z.string().min(4).max(200),
        idempotencyKey: z.string().min(12).max(128),
        reason: z.string().min(3).max(280),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc("zr_reverse_reward_transaction", {
      p_tenant_id: data.tenantId,
      p_original_reference: data.originalReference,
      p_idempotency_key: data.idempotencyKey,
      p_reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return result as { ok: boolean; duplicate: boolean; entry_ids: string[] };
  });
