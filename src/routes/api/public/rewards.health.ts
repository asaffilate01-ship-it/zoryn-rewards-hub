import { createFileRoute } from "@tanstack/react-router";

const json = (payload: unknown, status: number) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export const Route = createFileRoute("/api/public/rewards/health")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const [jobs, alerts, reconciliations] = await Promise.all([
          supabaseAdmin
            .from("zr_job_runs")
            .select("job_name, status, started_at")
            .order("started_at", { ascending: false })
            .limit(10),
          supabaseAdmin
            .from("zr_operational_alerts")
            .select("severity")
            .neq("status", "resolved")
            .limit(200),
          supabaseAdmin
            .from("zr_reconciliation_runs")
            .select("status, started_at")
            .order("started_at", { ascending: false })
            .limit(10),
        ]);

        if (jobs.error || alerts.error || reconciliations.error) {
          return json({ status: "degraded", reason: "health_query_failed" }, 503);
        }

        const failedJobs = (jobs.data ?? []).filter((j) => j.status === "failed").length;
        const criticalAlerts = (alerts.data ?? []).filter((a) => a.severity === "critical").length;
        const failedReconciliations = (reconciliations.data ?? []).filter(
          (r) => r.status === "failed",
        ).length;

        const degraded = failedJobs > 0 || criticalAlerts > 0 || failedReconciliations > 0;

        return json(
          {
            status: degraded ? "degraded" : "healthy",
            checkedAt: new Date().toISOString(),
            failedJobs,
            criticalAlerts,
            failedReconciliations,
            lastJobAt: jobs.data?.[0]?.started_at ?? null,
          },
          degraded ? 503 : 200,
        );
      },
    },
  },
});
