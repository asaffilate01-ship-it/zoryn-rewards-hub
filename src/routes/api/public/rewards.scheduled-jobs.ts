import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  job: z.enum(["funding-thresholds", "liability-snapshots", "notification-retry"]),
});

const json = (payload: unknown, status: number) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/rewards/scheduled-jobs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CRON_SHARED_SECRET"];
        if (!secret) return json({ error: "cron_not_configured" }, 503);

        const provided = request.headers.get("x-cron-secret") ?? "";
        if (!timingSafeEqual(provided, secret)) return json({ error: "unauthorized" }, 401);

        const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
        if (!parsed.success) return json({ error: "unsupported_job" }, 400);
        const job = parsed.data.job;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const run = await supabaseAdmin
          .from("zr_job_runs")
          .insert({ job_name: job, status: "running" })
          .select("id")
          .single();
        if (run.error) return json({ error: "job_start_failed" }, 500);

        try {
          let processed = 0;

          if (job === "funding-thresholds") {
            const result = await supabaseAdmin.rpc("zr_enforce_funding_thresholds");
            if (result.error) throw new Error(result.error.message);
            processed = Number(result.data ?? 0);
          } else if (job === "liability-snapshots") {
            const tenants = await supabaseAdmin.from("reward_tenants").select("id");
            if (tenants.error) throw new Error(tenants.error.message);
            for (const tenant of tenants.data ?? []) {
              const result = await supabaseAdmin.rpc("zr_create_liability_snapshot", {
                p_tenant_id: tenant.id,
              });
              if (result.error) throw new Error(result.error.message);
              processed += 1;
            }
          } else {
            const nowIso = new Date().toISOString();
            const pending = await supabaseAdmin
              .from("zr_notification_outbox")
              .select("id, attempt_count")
              .in("status", ["queued", "failed"])
              .or(`next_attempt_at.is.null,next_attempt_at.lte.${nowIso}`)
              .lt("attempt_count", 5)
              .limit(100);
            if (pending.error) throw new Error(pending.error.message);

            for (const row of pending.data ?? []) {
              const attempt = Number(row.attempt_count ?? 0) + 1;
              const backoffMinutes = Math.min(2 ** attempt, 60);
              const update = await supabaseAdmin
                .from("zr_notification_outbox")
                .update({
                  attempt_count: attempt,
                  status: attempt >= 5 ? "dead_letter" : "queued",
                  next_attempt_at: new Date(Date.now() + backoffMinutes * 60_000).toISOString(),
                })
                .eq("id", row.id);
              if (update.error) throw new Error(update.error.message);
              processed += 1;
            }
          }

          await supabaseAdmin
            .from("zr_job_runs")
            .update({
              status: "passed",
              processed_count: processed,
              completed_at: new Date().toISOString(),
            })
            .eq("id", run.data.id);

          return json({ ok: true, job, processed }, 200);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          await supabaseAdmin
            .from("zr_job_runs")
            .update({
              status: "failed",
              error_count: 1,
              details: { error: message },
              completed_at: new Date().toISOString(),
            })
            .eq("id", run.data.id);
          console.error("[scheduled-jobs]", job, message);
          return json({ error: "job_failed" }, 500);
        }
      },
    },
  },
});
