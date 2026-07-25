import { createServerFn } from "@tanstack/react-start";
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
