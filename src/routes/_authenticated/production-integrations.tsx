import { createFileRoute } from "@tanstack/react-router";
import { PlatformShell } from "@/components/PlatformShell";
import { ProductionIntegrationsCentre } from "@/features/launch/ProductionIntegrationsCentre";

const description =
  "Provider-Verbindungen, Abonnements, Affiliate-Transaktionen, Monitoring-Alerts und Restore-Nachweise in einer Kontrollzentrale.";

export const Route = createFileRoute("/_authenticated/production-integrations")({
  component: ProductionIntegrationsPage,
  head: () => ({
    meta: [
      { title: "Produktions-Integrationen – Zoryn Rewards" },
      { name: "description", content: description },
      { property: "og:title", content: "Produktions-Integrationen – Zoryn Rewards" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProductionIntegrationsPage() {
  return (
    <PlatformShell eyebrow="Produktion" title="Integrationen" description={description}>
      <ProductionIntegrationsCentre />
    </PlatformShell>
  );
}
