import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyReferral = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("referral_code, referred_by")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const { count } = await context.supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", context.userId);
    return {
      code: data?.referral_code ?? null,
      referred_by: data?.referred_by ?? null,
      invited_count: count ?? 0,
    };
  });

export const applyReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ code: z.string().min(4).max(16) }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: res, error } = await supabaseAdmin.rpc("apply_referral", {
      _user_id: context.userId,
      _code: data.code.toUpperCase(),
    });
    if (error) throw new Error(error.message);
    return res as { ok: boolean; points: number };
  });
