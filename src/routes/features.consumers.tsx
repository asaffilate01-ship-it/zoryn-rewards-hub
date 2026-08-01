import { createFileRoute } from "@tanstack/react-router";
import { Wallet, QrCode, MapPin, Gift, ShieldCheck, Users } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";
import { useT } from "@/lib/i18n";

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
  component: ConsumersFeaturePage,
});

function ConsumersFeaturePage() {
  const t = useT();
  return (
    <FeaturePage
      eyebrow={t("Für Verbraucher:innen")}
      title={t("Eine Wallet, jedes Angebot")}
      description={t(
        "Sammle Punkte bei allen Zoryn-Partnern, sieh Angebote in deiner Nähe und löse Rewards an der Kasse ein.",
      )}
      features={[
        {
          icon: Wallet,
          title: t("Eine Mitgliedsnummer"),
          body: t("Ein Konto für alle Partner — keine Karten-Chaos, kein Doppel-Login."),
        },
        {
          icon: QrCode,
          title: t("QR am POS"),
          body: t("Code scannen, Punkte einlösen. Ohne App-Zwang für den ersten Kauf."),
        },
        {
          icon: MapPin,
          title: t("In der Nähe"),
          body: t("Zeigt Partner in Laufweite mit aktiven Angeboten."),
        },
        {
          icon: Gift,
          title: t("Rewards & Cashback"),
          body: t("Punkte in Prämien, Gutscheine oder Cashback verwandeln."),
        },
        {
          icon: Users,
          title: t("Freunde einladen"),
          body: t("500 Punkte für dich, 500 für deine Freundin."),
        },
        {
          icon: ShieldCheck,
          title: t("Sicher & DSGVO"),
          body: t("EU-Hosting, doppeltes Ledger, transparente Historie."),
        },
      ]}
    />
  );
}
