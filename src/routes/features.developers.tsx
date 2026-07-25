import { createFileRoute } from "@tanstack/react-router";
import { Code2, KeyRound, Webhook, BookOpen, Shield, Boxes } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";

export const Route = createFileRoute("/features/developers")({
  head: () => ({
    meta: [
      { title: "Entwickler — Zoryn" },
      { name: "description", content: "API-Roadmap für Zoryn: Punkte, Rewards, Webhooks. In Kürze." },
      { property: "og:title", content: "Zoryn für Entwickler" },
      { property: "og:description", content: "REST + Webhooks für die Zoryn-Loyalty-Plattform." },
      { property: "og:url", content: "/features/developers" },
    ],
    links: [{ rel: "canonical", href: "/features/developers" }],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Entwickler"
      title="Bau auf Zoryn"
      description="Sauberer REST-Layer, Webhooks für POS und E-Commerce, klare Sandbox — in Vorbereitung."
      features={[
        { icon: Code2, title: "REST API", body: "Punkte vergeben, Wallets lesen, Rewards einlösen." },
        { icon: Webhook, title: "Webhooks", body: "Buchungen, Redemption, Kampagnen in Echtzeit." },
        { icon: KeyRound, title: "Scoped Keys", body: "Merchant-, Region- und Marken-scoped Tokens." },
        { icon: Boxes, title: "SDKs", body: "TypeScript zuerst, weitere folgen." },
        { icon: BookOpen, title: "Sandbox", body: "Test-Merchants und Test-Karten für dein Team." },
        { icon: Shield, title: "Idempotenz", body: "Alle Schreibpfade nehmen Idempotency-Keys." },
      ]}
      ctaLabel="Auf die Warteliste"
      ctaTo="/legal/complaints"
    />
  ),
});
