import { createFileRoute } from "@tanstack/react-router";
import { Code2, KeyRound, Webhook, BookOpen, Shield, Boxes } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/features/developers")({
  head: () => ({
    meta: [
      { title: "Entwickler — Zoryn" },
      {
        name: "description",
        content: "API-Roadmap für Zoryn: Punkte, Rewards, Webhooks. In Kürze.",
      },
      { property: "og:title", content: "Zoryn für Entwickler" },
      { property: "og:description", content: "REST + Webhooks für die Zoryn-Loyalty-Plattform." },
      { property: "og:url", content: "/features/developers" },
    ],
    links: [{ rel: "canonical", href: "/features/developers" }],
  }),
  component: DevelopersFeaturePage,
});

function DevelopersFeaturePage() {
  const t = useT();
  return (
    <FeaturePage
      eyebrow={t("Entwickler")}
      title={t("Bau auf Zoryn")}
      description={t(
        "Sauberer REST-Layer, Webhooks für POS und E-Commerce, klare Sandbox — in Vorbereitung.",
      )}
      features={[
        {
          icon: Code2,
          title: t("REST API"),
          body: t("Punkte vergeben, Wallets lesen, Rewards einlösen."),
        },
        {
          icon: Webhook,
          title: t("Webhooks"),
          body: t("Buchungen, Redemption, Kampagnen in Echtzeit."),
        },
        {
          icon: KeyRound,
          title: t("Scoped Keys"),
          body: t("Merchant-, Region- und Marken-scoped Tokens."),
        },
        { icon: Boxes, title: t("SDKs"), body: t("TypeScript zuerst, weitere folgen.") },
        {
          icon: BookOpen,
          title: t("Sandbox"),
          body: t("Test-Merchants und Test-Karten für dein Team."),
        },
        {
          icon: Shield,
          title: t("Idempotenz"),
          body: t("Alle Schreibpfade nehmen Idempotency-Keys."),
        },
      ]}
      ctaLabel={t("Auf die Warteliste")}
      ctaTo="/legal/complaints"
    />
  );
}
