import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createInput = z.object({
  merchantId: z.string().uuid(),
  name: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  multiplier: z.number().min(1).max(10),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export const listActiveCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const supa = createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await supa
    .from("campaigns")
    .select("id, merchant_id, name, description, multiplier, starts_at, ends_at, merchants(name)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listMerchantCampaigns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ merchantId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("campaigns")
      .select("id, name, description, multiplier, starts_at, ends_at, active, created_at")
      .eq("merchant_id", data.merchantId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => createInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("campaigns")
      .insert({
        merchant_id: data.merchantId,
        name: data.name,
        description: data.description ?? null,
        multiplier: data.multiplier,
        starts_at: data.startsAt ?? new Date().toISOString(),
        ends_at: data.endsAt ?? null,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const toggleCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ campaignId: z.string().uuid(), active: z.boolean() }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("campaigns")
      .update({ active: data.active })
      .eq("id", data.campaignId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ campaignId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("campaigns").delete().eq("id", data.campaignId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
