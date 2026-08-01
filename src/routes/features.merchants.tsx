import { createFileRoute } from "@tanstack/react-router";
import { Store, LineChart, Megaphone, CreditCard, Users2, Boxes } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/features/merchants")({
  head: () => ({
    meta: [
      { title: "Für Unternehmen — Zoryn" },
      {
        name: "description",
        content:
          "Loyalty ohne App-Zwang. Self-Serve-Portal, Rewards, Kampagnen und Abrechnung in einem.",
      },
      { property: "og:title", content: "Zoryn für Unternehmen" },
      {
        property: "og:description",
        content: "Loyalty, Rewards und Kampagnen — alles in einem Portal.",
      },
      { property: "og:url", content: "/features/merchants" },
    ],
    links: [{ rel: "canonical", href: "/features/merchants" }],
  }),
  component: MerchantsFeaturePage,
});

function MerchantsFeaturePage() {
  const t = useT();
  return (
    <FeaturePage
      eyebrow={t("Für Unternehmen")}
      title={t("Loyalty, die dein Team wirklich nutzt")}
      description={t(
        "POS-Modus für Personal, Self-Serve für Owner, Prepaid-Guthaben statt Überraschungsrechnung.",
      )}
      features={[
        {
          icon: Store,
          title: t("Self-Serve Onboarding"),
          body: t("Filiale in unter 5 Minuten anlegen — ohne Sales-Call."),
        },
        {
          icon: LineChart,
          title: t("Kampagnen & Multiplikatoren"),
          body: t("2× Punkte am Vormittag mit einem Klick."),
        },
        {
          icon: Megaphone,
          title: t("Nearby-Sichtbarkeit"),
          body: t("Erscheine im In-der-Nähe-Feed der Zoryn-App."),
        },
        {
          icon: CreditCard,
          title: t("Prepaid-Guthaben"),
          body: t("Punkte-Ausgabe aus deinem Merchant-Wallet. Monatliches Settlement."),
        },
        {
          icon: Users2,
          title: t("Rollen & Personal"),
          body: t("Owner, Manager, Staff — sauber getrennte Rechte."),
        },
        {
          icon: Boxes,
          title: t("Rewards-Katalog"),
          body: t("Belohnungen mit einem Klick anlegen und Code-verifiziert einlösen."),
        },
      ]}
      ctaLabel={t("Merchant-Portal öffnen")}
      ctaTo="/merchant"
    />
  );
}
