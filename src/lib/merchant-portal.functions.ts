import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** List merchants the signed-in user is a member of. */
export const myMerchants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("merchant_members")
      .select("role, merchant:merchants(id, slug, name, category, brand_color, points_per_euro, is_active)")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .filter((r) => r.merchant)
      .map((r) => ({
        role: r.role as "owner" | "manager" | "staff",
        merchant: r.merchant as {
          id: string;
          slug: string;
          name: string;
          category: string | null;
          brand_color: string | null;
          points_per_euro: number;
          is_active: boolean;
        },
      }));
  });

const createInput = z.object({
  slug: z.string().min(3).max(48).regex(/^[a-z0-9-]+$/, "nur a-z, 0-9 und -"),
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  category: z.string().max(40).optional(),
  pointsPerEuro: z.number().int().min(1).max(1000),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const createMerchant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => createInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: id, error } = await supabase.rpc("create_merchant_with_owner", {
      _slug: data.slug,
      _name: data.name,
      _description: data.description ?? '',
      _category: data.category ?? '',
      _points_per_euro: data.pointsPerEuro,
      _brand_color: data.brandColor ?? '',
    });
    if (error) {
      if (/duplicate|unique/i.test(error.message)) throw new Error("Slug ist bereits vergeben.");
      throw new Error(error.message);
    }
    return { merchantId: id as string };
  });

export const merchantOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ merchantId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: merchant, error } = await supabase
      .from("merchants")
      .select("id, slug, name, description, category, brand_color, points_per_euro, is_active")
      .eq("id", data.merchantId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!merchant) throw new Error("Merchant nicht gefunden");

    const { data: txns } = await supabase
      .from("transactions")
      .select("id, kind, memo, created_at, actor_user_id")
      .eq("merchant_id", data.merchantId)
      .order("created_at", { ascending: false })
      .limit(30);

    const { data: members } = await supabase
      .from("merchant_members")
      .select("id, role, user_id, created_at")
      .eq("merchant_id", data.merchantId);

    return { merchant, transactions: txns ?? [], members: members ?? [] };
  });

const lookupInput = z.object({
  merchantId: z.string().uuid(),
  membership: z.string().min(4).max(32),
});
export const lookupCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => lookupInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("lookup_customer_by_membership", {
      _merchant_id: data.merchantId,
      _membership: data.membership,
    });
    if (error) throw new Error(error.message);
    const row = (rows ?? [])[0];
    if (!row) throw new Error("Mitgliedschaftsnummer nicht gefunden.");
    return row as { user_id: string; display_name: string; membership_number: string };
  });

const posInput = z.object({
  merchantId: z.string().uuid(),
  customerUserId: z.string().uuid(),
  amount: z.number().int().positive().max(1_000_000),
  idempotencyKey: z.string().min(8).max(128),
  memo: z.string().max(280).optional(),
});

export const merchantEarn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => posInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: id, error } = await context.supabase.rpc("merchant_earn_points", {
      _merchant_id: data.merchantId,
      _customer_user_id: data.customerUserId,
      _amount: data.amount,
      _idempotency_key: data.idempotencyKey,
      _memo: data.memo ?? '',
    });
    if (error) throw new Error(error.message);
    return { transactionId: id as string };
  });

export const merchantRedeem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => posInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: id, error } = await context.supabase.rpc("merchant_redeem_points", {
      _merchant_id: data.merchantId,
      _customer_user_id: data.customerUserId,
      _amount: data.amount,
      _idempotency_key: data.idempotencyKey,
      _memo: data.memo ?? '',
    });
    if (error) {
      if (/insufficient/i.test(error.message)) throw new Error("Kunde hat nicht genug Punkte.");
      throw new Error(error.message);
    }
    return { transactionId: id as string };
  });
