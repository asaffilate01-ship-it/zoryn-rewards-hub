import { createFileRoute } from "@tanstack/react-router";
import { ScanLine, Handshake, ShieldCheck, Clock, BadgeCheck, Smartphone } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/features/staff")({
  head: () => ({
    meta: [
      { title: "Für Personal — Zoryn" },
      {
        name: "description",
        content:
          "Ein Terminal fürs Team: Mitgliedsnummer eingeben, Punkte vergeben, Rewards einlösen.",
      },
      { property: "og:title", content: "Zoryn für Personal" },
      { property: "og:description", content: "POS-Terminal, schnell und ohne Reibungsverluste." },
      { property: "og:url", content: "/features/staff" },
    ],
    links: [{ rel: "canonical", href: "/features/staff" }],
  }),
  component: StaffFeaturePage,
});

function StaffFeaturePage() {
  const t = useT();
  return (
    <FeaturePage
      eyebrow={t("Für Personal")}
      title={t("Der schnellste POS für Loyalty")}
      description={t("Weniger Klicks, weniger Fehler. Vergabe und Einlösung in unter 10 Sekunden.")}
      features={[
        {
          icon: ScanLine,
          title: t("Nummer oder QR"),
          body: t("Mitglied per 8-stelligem Code oder QR erkennen."),
        },
        {
          icon: Clock,
          title: t("Unter 10 Sekunden"),
          body: t("Vergabe/Einlösung in einem Screen."),
        },
        {
          icon: BadgeCheck,
          title: t("Code-Verifikation"),
          body: t("Rewards nur mit gültigem Einlöse-Code entwerten."),
        },
        {
          icon: Handshake,
          title: t("Kein App-Zwang"),
          body: t("Kundschaft muss die App nicht offen haben."),
        },
        {
          icon: ShieldCheck,
          title: t("Rollenbasiert"),
          body: t("Owner-Freischaltung erforderlich, saubere Audit-Spur."),
        },
        { icon: Smartphone, title: t("Läuft auf allem"), body: t("Handy, Tablet, POS-Browser.") },
      ]}
      ctaLabel={t("POS öffnen")}
      ctaTo="/merchant"
    />
  );
}
