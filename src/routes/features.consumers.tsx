import { createFileRoute } from "@tanstack/react-router";
import { Wallet, QrCode, MapPin, Gift, ShieldCheck, Users } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";

export const Route = createFileRoute("/features/consumers")({
  head: () => ({
    meta: [
      { title: "Für dich — Zoryn" },
      {
        name: "description",
        content:
          "Eine Wallet für Punkte, Cashback und lokale Angebote. Sicher, transparent, deutsch.",
      },
      { property: "og:title", content: "Zoryn für dich" },
      {
        property: "og:description",
        content: "Alle Punkte, ein Konto — plus Angebote in deiner Nähe.",
      },
      { property: "og:url", content: "/features/consumers" },
    ],
    links: [{ rel: "canonical", href: "/features/consumers" }],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Für Verbraucher:innen"
      title="Eine Wallet, jedes Angebot"
      description="Sammle Punkte bei allen Zoryn-Partnern, sieh Angebote in deiner Nähe und löse Rewards an der Kasse ein."
      features={[
        {
          icon: Wallet,
          title: "Eine Mitgliedsnummer",
          body: "Ein Konto für alle Partner — keine Karten-Chaos, kein Doppel-Login.",
        },
        {
          icon: QrCode,
          title: "QR am POS",
          body: "Code scannen, Punkte einlösen. Ohne App-Zwang für den ersten Kauf.",
        },
        {
          icon: MapPin,
          title: "In der Nähe",
          body: "Zeigt Partner in Laufweite mit aktiven Angeboten.",
        },
        {
          icon: Gift,
          title: "Rewards & Cashback",
          body: "Punkte in Prämien, Gutscheine oder Cashback verwandeln.",
        },
        {
          icon: Users,
          title: "Freunde einladen",
          body: "500 Punkte für dich, 500 für deine Freundin.",
        },
        {
          icon: ShieldCheck,
          title: "Sicher & DSGVO",
          body: "EU-Hosting, doppeltes Ledger, transparente Historie.",
        },
      ]}
    />
  ),
});
