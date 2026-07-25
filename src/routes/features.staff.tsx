import { createFileRoute } from "@tanstack/react-router";
import { ScanLine, Handshake, ShieldCheck, Clock, BadgeCheck, Smartphone } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";

export const Route = createFileRoute("/features/staff")({
  head: () => ({
    meta: [
      { title: "Für Personal — Zoryn" },
      { name: "description", content: "Ein Terminal fürs Team: Mitgliedsnummer eingeben, Punkte vergeben, Rewards einlösen." },
      { property: "og:title", content: "Zoryn für Personal" },
      { property: "og:description", content: "POS-Terminal, schnell und ohne Reibungsverluste." },
      { property: "og:url", content: "/features/staff" },
    ],
    links: [{ rel: "canonical", href: "/features/staff" }],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Für Personal"
      title="Der schnellste POS für Loyalty"
      description="Weniger Klicks, weniger Fehler. Vergabe und Einlösung in unter 10 Sekunden."
      features={[
        { icon: ScanLine, title: "Nummer oder QR", body: "Mitglied per 8-stelligem Code oder QR erkennen." },
        { icon: Clock, title: "Unter 10 Sekunden", body: "Vergabe/Einlösung in einem Screen." },
        { icon: BadgeCheck, title: "Code-Verifikation", body: "Rewards nur mit gültigem Einlöse-Code entwerten." },
        { icon: Handshake, title: "Kein App-Zwang", body: "Kundschaft muss die App nicht offen haben." },
        { icon: ShieldCheck, title: "Rollenbasiert", body: "Owner-Freischaltung erforderlich, saubere Audit-Spur." },
        { icon: Smartphone, title: "Läuft auf allem", body: "Handy, Tablet, POS-Browser." },
      ]}
      ctaLabel="POS öffnen"
      ctaTo="/merchant"
    />
  ),
});
