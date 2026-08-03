import { createFileRoute } from "@tanstack/react-router";

const json = (payload: unknown, status: number) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export const Route = createFileRoute("/api/public/rewards/integration-health")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const [connections, alerts] = await Promise.all([
          supabaseAdmin
            .from("zr_integration_connections")
            .select("integration_type, provider, environment, status, last_success_at")
            .order("integration_type"),
          supabaseAdmin
            .from("zr_monitoring_alert_events")
            .select("severity")
            .neq("status", "resolved")
            .limit(100),
        ]);

        if (connections.error || alerts.error) {
          return json({ status: "degraded", reason: "integration_health_query_failed" }, 503);
        }

        const rows = connections.data ?? [];
        const openAlerts = alerts.data ?? [];
        const degraded =
          rows.some((row) => row.status === "degraded" || row.status === "offline") ||
          openAlerts.some((alert) => alert.severity === "critical");

        return json(
          {
            status: degraded ? "degraded" : "healthy",
            checkedAt: new Date().toISOString(),
            integrations: rows.map((row) => ({
              type: row.integration_type,
              provider: row.provider,
              environment: row.environment,
              status: row.status,
              lastSuccessAt: row.last_success_at,
            })),
            openAlertCount: openAlerts.length,
          },
          degraded ? 503 : 200,
        );
      },
    },
  },
});
