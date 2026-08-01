import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformShell, StatTile, formatEuroCents, formatNumber } from "@/components/PlatformShell";
import { platformOverview } from "@/lib/rewards-platform.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/rewards-production")({
  component: ProductionDashboard,
  head: () => ({
    meta: [
      { title: "Rewards Produktion – Zoryn" },
      {
        name: "description",
        content: "Live-Übersicht über Mandanten, Programme, Wallets und Reward-Verbindlichkeiten.",
      },
      { property: "og:title", content: "Rewards Produktion – Zoryn" },
      {
        property: "og:description",
        content: "Live-Übersicht über Mandanten, Programme, Wallets und Reward-Verbindlichkeiten.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProductionDashboard() {
  const t = useT();
  const fn = useServerFn(platformOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-overview"],
    queryFn: () => fn(),
  });

  return (
    <PlatformShell
      eyebrow="Rewards Produktion"
      title="Ein Loyalty-Betriebssystem für alle Mandanten."
      description="Standalone-SaaS und Zoryn-integrierte Programme in einer Ansicht: Wallets, Kampagnen, Finanzierung und Provider-Events."
    >
      {isLoading && <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Mandanten"
              value={formatNumber(data.totals.tenants)}
              hint="Aktive Rewards-Programme"
            />
            <StatTile
              label="Händler"
              value={formatNumber(data.totals.merchants)}
              hint="Inklusive Standorte"
            />
            <StatTile label="Mitglieder" value={formatNumber(data.totals.memberships)} />
            <StatTile label="Aktive Kampagnen" value={formatNumber(data.totals.activeCampaigns)} />
            <StatTile label="Ausgegebene Punkte" value={formatNumber(data.totals.issuedPoints)} />
            <StatTile label="Eingelöste Punkte" value={formatNumber(data.totals.redeemedPoints)} />
            <StatTile
              label="Offene Verbindlichkeit"
              value={formatEuroCents(data.totals.liabilityCents)}
              hint="Verfügbar plus ausstehend"
            />
            <StatTile
              label="Finanzierungsguthaben"
              value={formatEuroCents(data.totals.fundingBalanceCents)}
              hint="Reserviert: nicht verfügbar"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("Mandanten")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.tenants.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("Noch keine Mandanten angelegt.")}
                </p>
              )}
              {data.tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{tenant.name}</p>
                      <Badge variant="secondary">{tenant.mode}</Badge>
                      <Badge variant={tenant.status === "active" ? "default" : "outline"}>
                        {tenant.status}
                      </Badge>
                      {tenant.plan && <Badge variant="outline">{tenant.plan}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatNumber(tenant.merchants)} {t("Händler")} ·{" "}
                      {formatNumber(tenant.programmes)} {t("Programme")} ·{" "}
                      {formatNumber(tenant.memberships)} {t("Mitglieder")}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-right text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">{t("Verfügbar")}</p>
                      <p className="font-medium">{formatNumber(tenant.availablePoints)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("Ausstehend")}</p>
                      <p className="font-medium">{formatNumber(tenant.pendingPoints)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("Guthaben")}</p>
                      <p className="font-medium">{formatEuroCents(tenant.fundingBalanceCents)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Provider-Events")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-4">
              <StatTile label="Gesamt" value={formatNumber(data.events.total)} />
              <StatTile label="Empfangen" value={formatNumber(data.events.received)} />
              <StatTile label="Verarbeitet" value={formatNumber(data.events.processed)} />
              <StatTile label="Fehlgeschlagen" value={formatNumber(data.events.failed)} />
            </CardContent>
          </Card>
        </>
      )}
    </PlatformShell>
  );
}
