import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("platform_admin_overview");
    if (error) throw new Error(error.message);
    return data as {
      total_users: number;
      active_merchants: number;
      active_offers: number;
      transactions_30d: number;
      points_issued_30d: number;
      points_redeemed_30d: number;
      total_liability_points: number;
      open_claims: number;
    };
  });

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId, _role: "admin",
    });
    return Boolean(data);
  });

export const adminListMerchants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("admin_list_merchants");
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{
      id: string; name: string; slug: string; category: string | null;
      city: string | null; is_active: boolean; brand_color: string | null;
      points_per_euro: number; created_at: string;
    }>;
  });

export const adminSetMerchantActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ merchantId: z.string().uuid(), active: z.boolean() }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_set_merchant_active", {
      _merchant_id: data.merchantId, _active: data.active,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
