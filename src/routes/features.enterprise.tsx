import { createFileRoute } from "@tanstack/react-router";
import { Building2, Network, Settings2, ShieldCheck, LineChart, Users2 } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";

export const Route = createFileRoute("/features/enterprise")({
  head: () => ({
    meta: [
      { title: "Ketten & Franchise — Zoryn" },
      {
        name: "description",
        content: "Mehrere Filialen, mehrere Marken, ein Loyalty-System — mit SSO-ready Rollen.",
      },
      { property: "og:title", content: "Zoryn Enterprise" },
      { property: "og:description", content: "Loyalty für Ketten und Franchise." },
      { property: "og:url", content: "/features/enterprise" },
    ],
    links: [{ rel: "canonical", href: "/features/enterprise" }],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Ketten & Franchise"
      title="Loyalty im Konzern-Maßstab"
      description="Mehrere Filialen, mehrere Marken, ein Ledger — mit sauberer Trennung von Rechten und Abrechnung."
      features={[
        {
          icon: Building2,
          title: "Filialbaum",
          body: "Marke → Region → Filiale, klare Hierarchie.",
        },
        {
          icon: Network,
          title: "Cross-Brand-Wallets",
          body: "Punkte über Marken hinweg — mit Regeln, die du kontrollierst.",
        },
        {
          icon: Settings2,
          title: "Zentrale Kampagnen",
          body: "HQ steuert Aktionen, Filialen tunen lokal.",
        },
        {
          icon: ShieldCheck,
          title: "SSO-ready",
          body: "SAML/SCIM auf Roadmap für Konzernanbindung.",
        },
        {
          icon: LineChart,
          title: "Konsolidiertes Reporting",
          body: "Ledger + Settlements pro Marke und Region.",
        },
        {
          icon: Users2,
          title: "Rollen fein granular",
          body: "Owner, Regionalleitung, Filialleitung, Staff.",
        },
      ]}
      ctaLabel="Enterprise-Kontakt"
      ctaTo="/legal/complaints"
    />
  ),
});
