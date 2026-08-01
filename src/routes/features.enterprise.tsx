import { createFileRoute } from "@tanstack/react-router";
import { Building2, Network, Settings2, ShieldCheck, LineChart, Users2 } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";
import { useT } from "@/lib/i18n";

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
  component: EnterpriseFeaturePage,
});

function EnterpriseFeaturePage() {
  const t = useT();
  return (
    <FeaturePage
      eyebrow={t("Ketten & Franchise")}
      title={t("Loyalty im Konzern-Maßstab")}
      description={t(
        "Mehrere Filialen, mehrere Marken, ein Ledger — mit sauberer Trennung von Rechten und Abrechnung.",
      )}
      features={[
        {
          icon: Building2,
          title: t("Filialbaum"),
          body: t("Marke → Region → Filiale, klare Hierarchie."),
        },
        {
          icon: Network,
          title: t("Cross-Brand-Wallets"),
          body: t("Punkte über Marken hinweg — mit Regeln, die du kontrollierst."),
        },
        {
          icon: Settings2,
          title: t("Zentrale Kampagnen"),
          body: t("HQ steuert Aktionen, Filialen tunen lokal."),
        },
        {
          icon: ShieldCheck,
          title: t("SSO-ready"),
          body: t("SAML/SCIM auf Roadmap für Konzernanbindung."),
        },
        {
          icon: LineChart,
          title: t("Konsolidiertes Reporting"),
          body: t("Ledger + Settlements pro Marke und Region."),
        },
        {
          icon: Users2,
          title: t("Rollen fein granular"),
          body: t("Owner, Regionalleitung, Filialleitung, Staff."),
        },
      ]}
      ctaLabel={t("Enterprise-Kontakt")}
      ctaTo="/legal/complaints"
    />
  );
}
