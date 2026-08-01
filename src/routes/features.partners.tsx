import { createFileRoute } from "@tanstack/react-router";
import { Handshake, Megaphone, Percent, TrendingUp, Users, Globe2 } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/features/partners")({
  head: () => ({
    meta: [
      { title: "Partner & Affiliate — Zoryn" },
      { name: "description", content: "Werde Media- oder Affiliate-Partner von Zoryn." },
      { property: "og:title", content: "Zoryn Partner" },
      { property: "og:description", content: "Affiliate, Media und Distribution mit Zoryn." },
      { property: "og:url", content: "/features/partners" },
    ],
    links: [{ rel: "canonical", href: "/features/partners" }],
  }),
  component: PartnersFeaturePage,
});

function PartnersFeaturePage() {
  const t = useT();
  return (
    <FeaturePage
      eyebrow={t("Partner")}
      title={t("Wachse mit dem Zoryn-Netzwerk")}
      description={t("Media, Affiliate, Distribution — teile die Wallet, teile die Kundschaft.")}
      features={[
        {
          icon: Handshake,
          title: t("Affiliate-Deals"),
          body: t("Cashback-Kampagnen im Namen des Netzwerks."),
        },
        {
          icon: Percent,
          title: t("Revenue-Share"),
          body: t("Faire Beteiligung an Aktivierungen."),
        },
        {
          icon: Megaphone,
          title: t("Co-Marketing"),
          body: t("Feature-Placement in App, Blog und Social."),
        },
        {
          icon: Users,
          title: t("Zielgruppen-Zugang"),
          body: t("Aktive Loyalty-Nutzer:innen in DACH."),
        },
        { icon: TrendingUp, title: t("Reporting"), body: t("Konsolidierte Zahlen pro Kampagne.") },
        {
          icon: Globe2,
          title: t("LoungeTech-Netzwerk"),
          body: t("Kiezio, Rettio, Haccora, TrainDirekt teilen die Wallet."),
        },
      ]}
      ctaLabel={t("Partner werden")}
      ctaTo="/legal/complaints"
    />
  );
}
