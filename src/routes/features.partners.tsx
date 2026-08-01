import { createFileRoute } from "@tanstack/react-router";
import { Handshake, Megaphone, Percent, TrendingUp, Users, Globe2 } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";

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
  component: () => (
    <FeaturePage
      eyebrow="Partner"
      title="Wachse mit dem Zoryn-Netzwerk"
      description="Media, Affiliate, Distribution — teile die Wallet, teile die Kundschaft."
      features={[
        {
          icon: Handshake,
          title: "Affiliate-Deals",
          body: "Cashback-Kampagnen im Namen des Netzwerks.",
        },
        { icon: Percent, title: "Revenue-Share", body: "Faire Beteiligung an Aktivierungen." },
        {
          icon: Megaphone,
          title: "Co-Marketing",
          body: "Feature-Placement in App, Blog und Social.",
        },
        { icon: Users, title: "Zielgruppen-Zugang", body: "Aktive Loyalty-Nutzer:innen in DACH." },
        { icon: TrendingUp, title: "Reporting", body: "Konsolidierte Zahlen pro Kampagne." },
        {
          icon: Globe2,
          title: "LoungeTech-Netzwerk",
          body: "Kiezio, Rettio, Haccora, TrainDirekt teilen die Wallet.",
        },
      ]}
      ctaLabel="Partner werden"
      ctaTo="/legal/complaints"
    />
  ),
});
