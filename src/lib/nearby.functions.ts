import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

const input = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusM: z.number().int().min(100).max(50000).default(5000),
});

export const nearbyMerchants = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => input.parse(raw))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb.rpc("nearby_merchants", {
      _lat: data.lat,
      _lng: data.lng,
      _radius_m: data.radiusM,
    });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listActiveOffers = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("offers")
    .select(
      "id, title, description, reward_multiplier, bonus_points, min_spend_cents, ends_at, merchant:merchants(id, name, slug, brand_color, category, city)",
    )
    .eq("is_active", true)
    .order("reward_multiplier", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
});
