import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformShell, StatTile, formatEuroCents, formatNumber } from "@/components/PlatformShell";
import { liabilityOverview } from "@/lib/rewards-platform.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/liability-centre")({
  component: LiabilityCentrePage,
  head: () => ({
    meta: [
      { title: "Liability Centre – Zoryn" },
      {
        name: "description",
        content: "Reward-Verbindlichkeiten, Finanzierungsdeckung und Ledger-Bewegungen je Mandant.",
      },
      { property: "og:title", content: "Liability Centre – Zoryn" },
      {
        property: "og:description",
        content: "Reward-Verbindlichkeiten, Finanzierungsdeckung und Ledger-Bewegungen je Mandant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function LiabilityCentrePage() {
  const t = useT();
  const fn = useServerFn(liabilityOverview);
  const { data, isLoading, error } = useQuery({ queryKey: ["liability-overview"], queryFn: () => fn() });

  return (
    <PlatformShell
      eyebrow="Liability Centre"
      title="Jeder Punkt ist eine Verbindlichkeit – und gedeckt."
      description="Offene Reward-Verbindlichkeit, hinterlegtes Guthaben, Deckungsgrad und Reichweite je Mandant."
    >
      {isLoading && <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Offene Verbindlichkeit" value={formatEuroCents(data.totals.liabilityCents)} />
            <StatTile label="Hinterlegtes Guthaben" value={formatEuroCents(data.totals.fundedCents)} />
            <StatTile label="Reserviert" value={formatEuroCents(data.totals.reservedCents)} />
            <StatTile
              label="Deckungsgrad"
              value={`${Math.round(data.totals.coverageRatio * 100)}%`}
              hint="Guthaben geteilt durch Verbindlichkeit"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("Deckung je Mandant")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.tenants.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("Keine Daten verfügbar.")}</p>
              )}
              {data.tenants.map((tenant) => {
                const pct = Math.min(100, Math.round(tenant.coverageRatio * 100));
                const tone =
                  tenant.coverageRatio >= 1 ? "default" : tenant.coverageRatio >= 0.5 ? "secondary" : "destructive";
                return (
                  <div key={tenant.id} className="rounded-xl border border-border/60 bg-card/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{tenant.name}</p>
                      <Badge variant={tone}>{pct}% {t("gedeckt")}</Badge>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full gradient-brand" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
                      <span>
                        {t("Verbindlichkeit")}: {formatEuroCents(tenant.liabilityCents)}
                      </span>
                      <span>
                        {t("Guthaben")}: {formatEuroCents(tenant.fundedCents)}
                      </span>
                      <span>
                        {t("Reserviert")}: {formatEuroCents(tenant.reservedCents)}
                      </span>
                      <span>
                        {t("Reichweite")}:{" "}
                        {tenant.daysOfCover === null ? "—" : `${formatNumber(tenant.daysOfCover)} ${t("Tage")}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Letzte Ledger-Bewegungen")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.recentEntries.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("Noch keine Buchungen.")}</p>
              )}
              {data.recentEntries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/30 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.description ?? e.source}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleString()} · {e.status}
                    </p>
                  </div>
                  <span
                    className={`font-medium ${e.direction === "credit" ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {e.direction === "credit" ? "+" : "−"}
                    {formatNumber(e.amount)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </PlatformShell>
  );
}
