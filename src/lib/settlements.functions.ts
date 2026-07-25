import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const fundingOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ merchantId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("merchant_funding_overview", {
      _merchant_id: data.merchantId,
    });
    if (error) throw new Error(error.message);
    const row = (rows ?? [])[0] as { balance_cents: number; ledger: unknown } | undefined;
    return {
      balance_cents: Number(row?.balance_cents ?? 0),
      ledger: (row?.ledger ?? []) as Array<{
        id: string; kind: string; amount_cents: number; memo: string | null; created_at: string;
      }>,
    };
  });

export const depositFunds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({
      merchantId: z.string().uuid(),
      amountCents: z.number().int().positive().max(10_000_000),
      memo: z.string().max(200).optional(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("merchant_deposit_funds", {
      _merchant_id: data.merchantId,
      _amount_cents: data.amountCents,
      _memo: data.memo ?? "",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSettlements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ merchantId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("list_settlements", {
      _merchant_id: data.merchantId,
    });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Array<{
      id: string; period_start: string; period_end: string;
      points_issued: number; points_redeemed: number; net_liability_cents: number;
      status: "open" | "closed" | "paid"; closed_at: string | null;
    }>;
  });

export const computeSettlement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ merchantId: z.string().uuid(), periodStart: z.string() }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("compute_settlement", {
      _merchant_id: data.merchantId,
      _period_start: data.periodStart,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminCloseSettlement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ settlementId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_close_settlement", {
      _settlement_id: data.settlementId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRecentAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("admin_recent_audit", { _limit: 100 });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: {
      id: string; action: string; entity_type: string; entity_id: string | null;
      details: unknown; created_at: string; actor_user_id: string | null;
    }) => ({
      id: r.id,
      action: r.action,
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      details_json: JSON.stringify(r.details ?? {}),
      created_at: r.created_at,
      actor_user_id: r.actor_user_id,
    }));
  });
