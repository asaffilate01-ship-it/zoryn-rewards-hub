import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Wallet snapshot: balance in points + euro-equivalent + recent activity.
 */
export const getWallet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Ensure wallet exists (idempotent via admin — first login won't have one otherwise).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("ensure_user_wallet", { _user_id: userId });

    // Read balance via RLS-scoped view.
    const { data: balanceRow } = await supabase
      .from("account_balances")
      .select("balance_points, account_id")
      .eq("kind", "user_wallet")
      .eq("owner_user_id", userId)
      .maybeSingle();

    const balance = Number(balanceRow?.balance_points ?? 0);

    // Recent transactions with merchant.
    const { data: txns } = await supabase
      .from("transactions")
      .select("id, kind, memo, created_at, merchant_id, merchants(name, brand_color, category)")
      .eq("actor_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    // Attach signed amount for each transaction via the caller's ledger entries.
    const txnIds = (txns ?? []).map((t) => t.id);
    let signedByTxn = new Map<string, number>();
    if (txnIds.length > 0 && balanceRow?.account_id) {
      const { data: entries } = await supabase
        .from("ledger_entries")
        .select("transaction_id, direction, amount_points")
        .eq("account_id", balanceRow.account_id)
        .in("transaction_id", txnIds);
      signedByTxn = new Map(
        (entries ?? []).map((e) => [
          e.transaction_id,
          e.direction === "credit" ? e.amount_points : -e.amount_points,
        ]),
      );
    }

    return {
      balance_points: balance,
      euro_equivalent: balance / 100,
      transactions: (txns ?? []).map((t) => ({
        id: t.id,
        kind: t.kind,
        memo: t.memo,
        created_at: t.created_at,
        signed_points: signedByTxn.get(t.id) ?? 0,
        merchant: t.merchants
          ? {
              name: (t.merchants as { name: string }).name,
              brand_color: (t.merchants as { brand_color: string | null }).brand_color,
              category: (t.merchants as { category: string | null }).category,
            }
          : null,
      })),
    };
  });

/**
 * Earn points at a merchant. Server-authoritative, idempotent.
 * Client passes an idempotency key so a double-tap can't double-credit.
 */
const earnInput = z.object({
  merchantId: z.string().uuid(),
  amount: z.number().int().positive().max(1_000_000),
  idempotencyKey: z.string().min(8).max(128),
  memo: z.string().max(280).optional(),
});

export const earnPoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => earnInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: txnId, error } = await supabaseAdmin.rpc("earn_points", {
      _user_id: context.userId,
      _merchant_id: data.merchantId,
      _amount: data.amount,
      _idempotency_key: data.idempotencyKey,
      _memo: data.memo,
    });
    if (error) throw new Error(error.message);
    return { transaction_id: txnId as string };
  });

/**
 * Redeem points. Server checks balance atomically.
 */
const redeemInput = z.object({
  amount: z.number().int().positive().max(1_000_000),
  idempotencyKey: z.string().min(8).max(128),
  memo: z.string().max(280).optional(),
  merchantId: z.string().uuid().optional(),
});

export const redeemPoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => redeemInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: txnId, error } = await supabaseAdmin.rpc("redeem_points", {
      _user_id: context.userId,
      _amount: data.amount,
      _idempotency_key: data.idempotencyKey,
      _memo: data.memo,
      _merchant_id: data.merchantId,
    });
    if (error) {
      // Postgres raises with our custom message on insufficient balance.
      if (/insufficient balance/i.test(error.message)) {
        throw new Error("Nicht genug Punkte. Bitte sammle erst mehr.");
      }
      throw new Error(error.message);
    }
    return { transaction_id: txnId as string };
  });
