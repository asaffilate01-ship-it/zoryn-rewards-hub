import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, PlugZap, Radio } from "lucide-react";
import { integrationHealth } from "@/lib/integrations.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function IntegrationHealthCard() {
  const healthFn = useServerFn(integrationHealth);
  const { data, isLoading, error } = useQuery({
    queryKey: ["integrationHealth"],
    queryFn: () => healthFn(),
    refetchInterval: 60_000,
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 font-display text-base">
          <PlugZap className="size-4 text-brand" />
          Integrations-Health
        </CardTitle>
        {data && (
          <Badge variant={data.events.failed > 0 ? "destructive" : "secondary"}>
            {data.events.failed > 0 ? `${data.events.failed} Fehler` : "Stabil"}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Laden…</p>}
        {error && (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Fehler"}
          </p>
        )}
        {data && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Mandanten" value={data.tenants.length} />
              <Metric label="Events (letzte 500)" value={data.events.total} />
              <Metric label="Verarbeitet" value={data.events.processed} />
              <Metric label="Outbox offen" value={data.outbox_pending} />
            </div>

            <div className="space-y-2">
              {data.tenants.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Radio className="size-3.5 text-muted-foreground" />
                    {t.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.mode}</span>
                </div>
              ))}
            </div>

            {data.integrations.length > 0 && (
              <div className="space-y-2">
                {data.integrations.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Activity className="size-3.5 text-muted-foreground" />
                      {i.provider} · {i.integration_type}
                    </span>
                    <Badge variant={i.status === "live" ? "default" : "secondary"}>
                      {i.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Letztes Event:{" "}
              {data.events.last_received_at
                ? new Date(data.events.last_received_at).toLocaleString("de-DE")
                : "—"}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
