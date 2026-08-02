import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFinalLaunchOverview, revokeMobileDevice } from "@/lib/launch.functions";
import { StatTile } from "@/components/PlatformShell";
import { useT } from "@/lib/i18n";

const TONE: Record<string, string> = {
  healthy: "text-emerald-500",
  degraded: "text-amber-500",
  failed: "text-destructive",
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

export function FinalLaunchCentre() {
  const t = useT();
  const queryClient = useQueryClient();
  const load = useServerFn(getFinalLaunchOverview);
  const revoke = useServerFn(revokeMobileDevice);

  const { data, isLoading, error } = useQuery({
    queryKey: ["final-launch"],
    queryFn: () => load(),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  if (!data) return null;

  const a = data.acceptance;
  const gates: Array<[string, boolean]> = [
    ["Engineering", a?.engineeringPassed ?? false],
    ["Sicherheit", a?.securityPassed ?? false],
    ["Betrieb", a?.operationsPassed ?? false],
    ["Recht", a?.legalPassed ?? false],
    ["Pilot", a?.pilotPassed ?? false],
  ];
  const passedGates = gates.filter(([, ok]) => ok).length;
  const activeDevices = data.devices.filter((d) => !d.revokedAt);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Freigabestatus"
          value={a?.approved ? t("Freigegeben") : t("Ausstehend")}
          hint={a ? `${a.releaseName} · ${a.environment}` : "Kein Release erfasst"}
        />
        <StatTile
          label="Bestandene Gates"
          value={`${passedGates}/${gates.length}`}
          hint="Engineering, Sicherheit, Betrieb, Recht, Pilot"
        />
        <StatTile
          label="Aktive Geräte"
          value={String(activeDevices.length)}
          hint="Registrierte Mobilgeräte"
        />
        <StatTile
          label="Geplante Jobs"
          value={String(data.jobs.filter((j) => j.enabled).length)}
          hint="Aktive Hintergrundläufe"
        />
      </div>

      <Section title="Startfreigabe">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {gates.map(([label, ok]) => (
            <article key={label} className="rounded-xl border border-border/60 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t(label)}</p>
              <p
                className={`mt-1.5 text-base font-semibold ${ok ? "text-emerald-500" : "text-muted-foreground"}`}
              >
                {ok ? t("Bestanden") : t("Ausstehend")}
              </p>
            </article>
          ))}
        </div>
        {!a && (
          <p className="text-sm text-muted-foreground">
            {t("Noch kein Release zur Freigabe erfasst.")}
          </p>
        )}
      </Section>

      <Section title="Monitoring-Prüfungen">
        {data.checks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("Keine Prüfungen erfasst.")}</p>
        ) : (
          data.checks.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-4 py-2.5 text-sm"
            >
              <span className="font-medium">{c.checkName}</span>
              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                {c.latencyMs !== null && <span>{c.latencyMs} ms</span>}
                <span className={TONE[c.status] ?? "text-muted-foreground"}>{t(c.status)}</span>
              </span>
            </div>
          ))
        )}
      </Section>

      <Section title="Mobile Geräte">
        {data.devices.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("Keine Geräte registriert.")}</p>
        ) : (
          data.devices.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/40 px-4 py-2.5 text-sm"
            >
              <span className="font-medium">
                {d.deviceName ?? d.platform} · {d.platform}
              </span>
              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{d.pushEnabled ? t("Push an") : t("Push aus")}</span>
                <span>{d.biometricEnabled ? t("Biometrie an") : t("Biometrie aus")}</span>
                {d.revokedAt ? (
                  <span className="text-destructive">{t("Widerrufen")}</span>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      await revoke({ data: { deviceId: d.id } });
                      await queryClient.invalidateQueries({ queryKey: ["final-launch"] });
                    }}
                    className="rounded-full border border-border/70 px-3 py-1 font-medium text-foreground transition hover:bg-card/60"
                  >
                    {t("Widerrufen")}
                  </button>
                )}
              </span>
            </div>
          ))
        )}
      </Section>

      <Section title="Geplante Jobs">
        {data.jobs.map((j) => (
          <div
            key={j.id}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-4 py-2.5 text-sm"
          >
            <span className="font-medium">{j.jobName}</span>
            <span className="flex items-center gap-3 text-xs text-muted-foreground">
              <code>{j.scheduleExpression}</code>
              <span className={j.enabled ? "text-emerald-500" : "text-muted-foreground"}>
                {j.enabled ? t("Aktiv") : t("Inaktiv")}
              </span>
            </span>
          </div>
        ))}
      </Section>
    </div>
  );
}
