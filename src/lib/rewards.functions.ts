import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listActiveRewards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("rewards")
      .select(
        "id, title, description, cost_points, stock, merchant_id, merchants(name, brand_color, category)",
      )
      .eq("active", true)
      .order("cost_points", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description as string | null,
      cost_points: r.cost_points,
      stock: r.stock as number | null,
      merchant_id: r.merchant_id,
      merchant: r.merchants as {
        name: string;
        brand_color: string | null;
        category: string | null;
      } | null,
    }));
  });

export const listMerchantRewards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ merchantId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("rewards")
      .select("id, title, description, cost_points, stock, active, created_at")
      .eq("merchant_id", data.merchantId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const createInput = z.object({
  merchantId: z.string().uuid(),
  title: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  costPoints: z.number().int().min(1).max(10_000_000),
  stock: z.number().int().min(0).max(1_000_000).optional(),
});
export const createReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => createInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("rewards").insert({
      merchant_id: data.merchantId,
      title: data.title,
      description: data.description ?? null,
      cost_points: data.costPoints,
      stock: data.stock ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ rewardId: z.string().uuid(), active: z.boolean() }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("rewards")
      .update({ active: data.active })
      .eq("id", data.rewardId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ rewardId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("rewards").delete().eq("id", data.rewardId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const redeemReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({ rewardId: z.string().uuid(), idempotencyKey: z.string().min(8).max(128) })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("redeem_reward", {
      _user_id: context.userId,
      _reward_id: data.rewardId,
      _idempotency_key: data.idempotencyKey,
    });
    if (error) {
      const m = error.message;
      if (/reward_not_found/.test(m)) throw new Error("Belohnung nicht gefunden.");
      if (/reward_inactive/.test(m)) throw new Error("Belohnung ist nicht aktiv.");
      if (/reward_out_of_stock/.test(m)) throw new Error("Ausverkauft.");
      if (/insufficient/i.test(m)) throw new Error("Nicht genug Punkte.");
      throw new Error(m);
    }
    const row = (rows as Array<{ redemption_id: string; code: string; transaction_id: string }>)[0];
    return row;
  });

export const listMyRedemptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("reward_redemptions")
      .select(
        "id, code, status, reward_title, cost_points, created_at, used_at, merchant_id, merchants(name, brand_color)",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      ...r,
      merchant: r.merchants as { name: string; brand_color: string | null } | null,
    }));
  });

export const useRewardCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ merchantId: z.string().uuid(), code: z.string().min(4).max(32) }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("use_reward_code", {
      _merchant_id: data.merchantId,
      _code: data.code,
      _staff_user_id: context.userId,
    });
    if (error) {
      const m = error.message;
      if (/not_a_member/.test(m)) throw new Error("Kein Zugriff auf diesen Merchant.");
      if (/code_not_found/.test(m)) throw new Error("Code nicht gefunden.");
      if (/code_already_used/.test(m)) throw new Error("Code wurde bereits eingelöst.");
      if (/code_already_/.test(m)) throw new Error("Code ist nicht mehr gültig.");
      throw new Error(m);
    }
    return (
      rows as Array<{
        redemption_id: string;
        reward_title: string;
        customer_user_id: string;
        cost_points: number;
      }>
    )[0];
  });
