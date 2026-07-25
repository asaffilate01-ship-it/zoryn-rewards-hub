import { createFileRoute } from "@tanstack/react-router";
import { Store, LineChart, Megaphone, CreditCard, Users2, Boxes } from "lucide-react";
import { FeaturePage } from "@/components/FeaturePage";

export const Route = createFileRoute("/features/merchants")({
  head: () => ({
    meta: [
      { title: "Für Unternehmen — Zoryn" },
      { name: "description", content: "Loyalty ohne App-Zwang. Self-Serve-Portal, Rewards, Kampagnen und Abrechnung in einem." },
      { property: "og:title", content: "Zoryn für Unternehmen" },
      { property: "og:description", content: "Loyalty, Rewards und Kampagnen — alles in einem Portal." },
      { property: "og:url", content: "/features/merchants" },
    ],
    links: [{ rel: "canonical", href: "/features/merchants" }],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Für Unternehmen"
      title="Loyalty, die dein Team wirklich nutzt"
      description="POS-Modus für Personal, Self-Serve für Owner, Prepaid-Guthaben statt Überraschungsrechnung."
      features={[
        { icon: Store, title: "Self-Serve Onboarding", body: "Filiale in unter 5 Minuten anlegen — ohne Sales-Call." },
        { icon: LineChart, title: "Kampagnen & Multiplikatoren", body: "2× Punkte am Vormittag mit einem Klick." },
        { icon: Megaphone, title: "Nearby-Sichtbarkeit", body: "Erscheine im In-der-Nähe-Feed der Zoryn-App." },
        { icon: CreditCard, title: "Prepaid-Guthaben", body: "Punkte-Ausgabe aus deinem Merchant-Wallet. Monatliches Settlement." },
        { icon: Users2, title: "Rollen & Personal", body: "Owner, Manager, Staff — sauber getrennte Rechte." },
        { icon: Boxes, title: "Rewards-Katalog", body: "Belohnungen mit einem Klick anlegen und Code-verifiziert einlösen." },
      ]}
      ctaLabel="Merchant-Portal öffnen"
      ctaTo="/merchant"
    />
  ),
});
