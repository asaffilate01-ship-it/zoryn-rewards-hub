import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function randomCode(len = 8) {
  // Base32-like, human-friendly (no 0/O/1/I)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const createInput = z.object({
  merchantId: z.string().uuid(),
  amountCents: z.number().int().positive().max(10_000_000),
  memo: z.string().max(280).optional(),
  ttlSeconds: z.number().int().min(30).max(600).default(180),
});

export const createEarnChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => createInput.parse(raw))
  .handler(async ({ data, context }) => {
    const code = randomCode(8);
    const expires = new Date(Date.now() + data.ttlSeconds * 1000).toISOString();
    const { data: row, error } = await context.supabase
      .from("earn_challenges")
      .insert({
        code,
        merchant_id: data.merchantId,
        issued_by: context.userId,
        amount_cents: data.amountCents,
        memo: data.memo ?? null,
        expires_at: expires,
      })
      .select("id, code, expires_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const claimInput = z.object({ code: z.string().min(4).max(32) });

export const claimEarnChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => claimInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("claim_earn_challenge", {
      _code: data.code.trim().toUpperCase(),
      _user_id: context.userId,
    });
    if (error) {
      const msg = error.message;
      if (/code_not_found/.test(msg)) throw new Error("Code nicht gefunden.");
      if (/already_claimed/.test(msg)) throw new Error("Code wurde bereits eingelöst.");
      if (/expired/.test(msg)) throw new Error("Code ist abgelaufen.");
      throw new Error(msg);
    }
    const row = (rows as Array<{ transaction_id: string; points_awarded: number; merchant_name: string; offer_title: string | null }>)[0];
    if (!row) throw new Error("Kein Ergebnis.");

    // notify user
    await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      kind: "earn_qr",
      title: `+${row.points_awarded} Punkte bei ${row.merchant_name}`,
      body: row.offer_title ? `Bonus-Aktion: ${row.offer_title}` : null,
      data: { transaction_id: row.transaction_id },
    });

    return row;
  });
