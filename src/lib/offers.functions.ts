import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createInput = z.object({
  merchantId: z.string().uuid(),
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  rewardMultiplier: z.number().min(1).max(20).default(1),
  bonusPoints: z.number().int().min(0).max(1_000_000).default(0),
  minSpendCents: z.number().int().min(0).max(10_000_000).default(0),
  endsAt: z.string().datetime().optional(),
});

export const createOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => createInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("offers")
      .insert({
        merchant_id: data.merchantId,
        title: data.title,
        description: data.description ?? null,
        reward_multiplier: data.rewardMultiplier,
        bonus_points: data.bonusPoints,
        min_spend_cents: data.minSpendCents,
        ends_at: data.endsAt ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listMerchantOffers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ merchantId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("offers")
      .select(
        "id, title, description, reward_multiplier, bonus_points, min_spend_cents, is_active, ends_at, created_at",
      )
      .eq("merchant_id", data.merchantId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const toggleOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ offerId: z.string().uuid(), isActive: z.boolean() }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("offers")
      .update({ is_active: data.isActive })
      .eq("id", data.offerId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ offerId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("offers").delete().eq("id", data.offerId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
