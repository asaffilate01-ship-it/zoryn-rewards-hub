import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { PlatformShell } from "@/components/PlatformShell";
import { scenarioLab } from "@/lib/rewards-platform.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/rewards-scenario-lab")({
  component: ScenarioLabPage,
  head: () => ({
    meta: [
      { title: "Scenario Lab – Zoryn" },
      {
        name: "description",
        content:
          "Live-Checks für Randfälle: ausstehende Rewards, Deckung, Duplikate, Stornos und Verbindlichkeit.",
      },
      { property: "og:title", content: "Scenario Lab – Zoryn" },
      {
        property: "og:description",
        content:
          "Live-Checks für Randfälle: ausstehende Rewards, Deckung, Duplikate, Stornos und Verbindlichkeit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const TONE: Record<string, "default" | "secondary" | "destructive"> = {
  healthy: "default",
  attention: "secondary",
  critical: "destructive",
};

function ScenarioLabPage() {
  const t = useT();
  const fn = useServerFn(scenarioLab);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["scenario-lab"],
    queryFn: () => fn(),
  });

  return (
    <PlatformShell
      eyebrow="Scenario Lab"
      title="Die Zustände prüfen, die Produktionssysteme oft übersehen."
      description="Jeder Check läuft gegen echte Daten: ausstehende Rewards, Finanzierungsdeckung, Duplikate, Stornos und Netzwerk-Verbindlichkeit."
    >
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-1.5 size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          {t("Checks erneut ausführen")}
        </Button>
        {data && (
          <span className="text-xs text-muted-foreground">
            {t("Zuletzt geprüft")}: {new Date(data.checkedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      <div className="space-y-3">
        {data?.scenarios.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{t(areaLabel(s.area))}</Badge>
                  <Badge variant={TONE[s.status] ?? "secondary"}>{t(statusLabel(s.status))}</Badge>
                </div>
                <p className="mt-2.5 font-medium">{t(s.title)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(s.description)}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-semibold tracking-tight">{s.metric}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PlatformShell>
  );
}

function areaLabel(area: string) {
  return area === "consumer"
    ? "Kunde"
    : area === "merchant"
      ? "Händler"
      : area === "integration"
        ? "Integration"
        : "Plattform";
}

function statusLabel(status: string) {
  return status === "healthy" ? "In Ordnung" : status === "attention" ? "Beobachten" : "Kritisch";
}
