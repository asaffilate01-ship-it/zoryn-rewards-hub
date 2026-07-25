import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SeriesRow = { day: string; earned: number; redeemed: number; txn_count?: number; new_users?: number };
export type TopCustomer = { user_id: string; display_name: string; earned: number; redeemed: number; visits: number };
export type TopMerchant = { merchant_id: string; name: string; slug: string; earned: number; redeemed: number; txns: number };

export const merchantSeries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ merchantId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("merchant_analytics_series", { _merchant_id: data.merchantId });
    if (error) throw new Error(error.message);
    return (rows ?? []) as SeriesRow[];
  });

export const merchantTopCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ merchantId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("merchant_top_customers", { _merchant_id: data.merchantId, _limit: 10 });
    if (error) throw new Error(error.message);
    return (rows ?? []) as TopCustomer[];
  });

export const adminSeries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("admin_platform_series");
    if (error) throw new Error(error.message);
    return (data ?? []) as SeriesRow[];
  });

export const adminTopMerchants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("admin_top_merchants", { _limit: 10 });
    if (error) throw new Error(error.message);
    return (data ?? []) as TopMerchant[];
  });

export type SearchHit = { kind: "merchant" | "offer" | "reward"; id: string; title: string; subtitle: string; slug: string; image_url: string | null; score: number };

export const globalSearch = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => z.object({ q: z.string().min(1).max(80) }).parse(raw))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const url = process.env.SUPABASE_URL!;
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: rows, error } = await client.rpc("global_search", { _q: data.q, _limit: 8 });
    if (error) throw new Error(error.message);
    return (rows ?? []) as SearchHit[];
  });
