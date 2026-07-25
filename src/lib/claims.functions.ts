import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const fileInput = z.object({
  merchantId: z.string().uuid().optional(),
  merchantName: z.string().min(2).max(120),
  purchaseDate: z.string(),
  amountEuros: z.number().min(0.5).max(10000),
  reference: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
});

export const fileClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => fileInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("missing_points_claims").insert({
      user_id: context.userId,
      merchant_id: data.merchantId ?? null,
      merchant_name: data.merchantName,
      purchase_date: data.purchaseDate,
      amount_cents: Math.round(data.amountEuros * 100),
      reference: data.reference ?? null,
      notes: data.notes ?? null,
      status: "open",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyClaims = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("missing_points_claims")
      .select("id, merchant_name, purchase_date, amount_cents, status, reference, notes, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListClaims = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("missing_points_claims")
      .select("id, user_id, merchant_id, merchant_name, purchase_date, amount_cents, status, reference, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminResolveClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({
      claimId: z.string().uuid(),
      approve: z.boolean(),
      points: z.number().int().min(1).max(1_000_000).optional(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_resolve_claim", {
      _claim_id: data.claimId,
      _approve: data.approve,
      _points: data.points,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
