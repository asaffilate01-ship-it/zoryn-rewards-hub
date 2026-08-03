import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { productionIntegrationsOverview } from "@/lib/production-integrations.functions";
import { StatTile, formatEuroCents } from "@/components/PlatformShell";
import { useT } from "@/lib/i18n";

const STATUS_TONE: Record<string, string> = {
  healthy: "text-emerald-500",
  configured: "text-emerald-500",
  active: "text-emerald-500",
  approved: "text-emerald-500",
  passed: "text-emerald-500",
  degraded: "text-amber-500",
  pending: "text-amber-500",
  trialing: "text-amber-500",
  past_due: "text-amber-500",
  warning: "text-amber-500",
  not_configured: "text-muted-foreground",
  offline: "text-destructive",
  failed: "text-destructive",
  critical: "text-destructive",
  reversed: "text-destructive",
  declined: "text-destructive",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 p-5">
      <h2 className="font-display text-lg font-semibold tracking-tight">{t(title)}</h2>
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, meta, status }: { label: string; meta?: string; status: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-background/40 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{label}</p>
        {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      <span
        className={`text-xs font-semibold uppercase tracking-wide ${STATUS_TONE[status] ?? "text-muted-foreground"}`}
      >
        {status}
      </span>
    </div>
  );
}

export function ProductionIntegrationsCentre() {
  const t = useT();
  const load = useServerFn(productionIntegrationsOverview);

  const { data, isLoading, error } = useQuery({
    queryKey: ["production-integrations"],
    queryFn: () => load(),
    refetchInterval: 30_000,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  if (!data) return null;

  const healthy = data.connections.filter((c) => c.status === "healthy").length;
  const criticalAlerts = data.alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label={t("Gesunde Integrationen")}
          value={`${healthy}/${data.connections.length}`}
        />
        <StatTile label={t("Abonnements")} value={String(data.subscriptions.length)} />
        <StatTile label={t("Affiliate-Transaktionen")} value={String(data.affiliate.length)} />
        <StatTile
          label={t("Offene Alerts")}
          value={`${data.alerts.length}${criticalAlerts ? ` (${criticalAlerts} kritisch)` : ""}`}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {t("Integrationsmodus")}: <span className="font-medium">{data.mode}</span>
      </p>

      <Section title="Provider-Verbindungen">
        {data.connections.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("Noch keine Verbindungen erfasst.")}</p>
        ) : (
          data.connections.map((c) => (
            <Row
              key={c.id}
              label={`${c.integration_type} · ${c.provider}`}
              meta={`${c.environment}${c.last_error ? ` · ${c.last_error}` : ""}`}
              status={c.status}
            />
          ))
        )}
      </Section>

      <Section title="Abonnements">
        {data.subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("Noch keine Abonnements.")}</p>
        ) : (
          data.subscriptions.map((s) => (
            <Row
              key={s.id}
              label={`${s.plan_code} · ${s.provider}`}
              meta={
                s.current_period_ends_at
                  ? `${t("Laufzeitende")}: ${new Date(s.current_period_ends_at).toLocaleDateString()}`
                  : undefined
              }
              status={s.status}
            />
          ))
        )}
      </Section>

      <Section title="Affiliate-Transaktionen">
        {data.affiliate.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("Noch keine Affiliate-Transaktionen.")}
          </p>
        ) : (
          data.affiliate.map((a) => (
            <Row
              key={a.id}
              label={`${a.provider} · ${a.provider_transaction_id}`}
              meta={`${t("Provision")}: ${formatEuroCents(a.commission_minor)}`}
              status={a.status}
            />
          ))
        )}
      </Section>

      <Section title="Offene Monitoring-Alerts">
        {data.alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("Keine offenen Alerts.")}</p>
        ) : (
          data.alerts.map((a) => (
            <Row key={a.id} label={a.title} meta={a.rule_key} status={a.severity} />
          ))
        )}
      </Section>

      <Section title="Backup- und Restore-Nachweise">
        {data.backups.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("Noch keine Restore-Tests erfasst.")}</p>
        ) : (
          data.backups.map((b) => (
            <Row
              key={b.id}
              label={`${b.environment} · ${b.backup_reference}`}
              meta={[
                b.recovery_time_seconds != null ? `RTO ${b.recovery_time_seconds}s` : null,
                b.ledger_verified ? t("Ledger geprüft") : null,
                b.tenant_isolation_verified ? t("Mandantentrennung geprüft") : null,
                b.scheduler_verified ? t("Scheduler geprüft") : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              status={b.status}
            />
          ))
        )}
      </Section>
    </div>
  );
}
