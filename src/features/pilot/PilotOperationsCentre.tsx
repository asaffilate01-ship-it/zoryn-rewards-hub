import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPilotOperations } from "@/lib/pilot.functions";
import { StatTile } from "@/components/PlatformShell";
import { useT } from "@/lib/i18n";

const STATUS_TONE: Record<string, string> = {
  passed: "text-emerald-500",
  running: "text-primary",
  warning: "text-amber-500",
  failed: "text-destructive",
  critical: "text-destructive",
};

function tone(value: string) {
  return STATUS_TONE[value] ?? "text-muted-foreground";
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 p-5">
      <h2 className="font-display text-lg font-semibold tracking-tight">{t(title)}</h2>
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

export function PilotOperationsCentre() {
  const t = useT();
  const load = useServerFn(getPilotOperations);
  const { data, isLoading, error } = useQuery({
    queryKey: ["pilot-operations"],
    queryFn: () => load(),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  if (!data) return null;

  const openCases = data.cases.filter((c) => c.status !== "closed" && c.status !== "resolved");

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Letzte Jobs"
          value={String(data.jobs.length)}
          hint="Geplante Hintergrundläufe"
        />
        <StatTile
          label="Offene Fälle"
          value={String(openCases.length)}
          hint="Support und Beschwerden"
        />
        <StatTile
          label="Offene Warnungen"
          value={String(data.alerts.length)}
          hint="Betriebswarnungen"
        />
        <StatTile
          label="Restore-Nachweise"
          value={String(data.backups.length)}
          hint="Geprüfte Wiederherstellungen"
        />
      </div>

      <Section title="Geplante Jobs">
        {data.jobs.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("Noch keine Jobläufe erfasst.")}</p>
        )}
        {data.jobs.map((job) => (
          <div
            key={job.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/40 p-3 text-sm"
          >
            <div>
              <p className="font-medium">{job.jobName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(job.startedAt).toLocaleString()} · {t("Verarbeitet")} {job.processedCount}{" "}
                · {t("Fehler")} {job.errorCount}
              </p>
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wide ${tone(job.status)}`}>
              {job.status}
            </span>
          </div>
        ))}
      </Section>

      <Section title="Support und Beschwerden">
        {data.cases.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("Keine offenen Fälle.")}</p>
        )}
        {data.cases.map((item) => (
          <div key={item.id} className="rounded-xl border border-border/60 bg-background/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{item.subject}</p>
              <span className="text-xs text-muted-foreground">{item.status}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.caseType} · {item.priority} · {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </Section>

      <Section title="Betriebswarnungen">
        {data.alerts.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("Keine offenen Warnungen.")}</p>
        )}
        {data.alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/40 p-3 text-sm"
          >
            <div>
              <p className="font-medium">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.alertType}</p>
            </div>
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${tone(alert.severity)}`}
            >
              {alert.severity}
            </span>
          </div>
        ))}
      </Section>

      <Section title="Backup-Wiederherstellung">
        {data.backups.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("Noch keine Restore-Nachweise erfasst.")}
          </p>
        )}
        {data.backups.map((backup) => (
          <div
            key={backup.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/40 p-3 text-sm"
          >
            <div>
              <p className="font-medium">
                {backup.environment} · {backup.backupReference}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(backup.restoredAt).toLocaleString()}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {t("Ledger")}: {backup.ledgerVerified ? t("geprüft") : t("offen")} · {t("Isolation")}:{" "}
              {backup.tenantIsolationVerified ? t("geprüft") : t("offen")}
            </span>
          </div>
        ))}
      </Section>
    </div>
  );
}
