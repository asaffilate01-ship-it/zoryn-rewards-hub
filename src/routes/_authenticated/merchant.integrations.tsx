import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, PlugZap, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/merchant/integrations")({
  component: IntegrationsPage,
  head: () => ({
    meta: [
      { title: "Integrationen — Zoryn Business" },
      {
        name: "description",
        content:
          "Zoryn Rewards standalone betreiben oder Banking, Payments, POS und LoungeTech-Anwendungen anbinden.",
      },
      { property: "og:title", content: "Integrationen — Zoryn Business" },
      {
        property: "og:description",
        content: "Signierte Events, Idempotenz und ein anbieterunabhängiger Rewards-Ledger.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const INTEGRATIONS = [
  {
    name: "Zoryn Platform",
    detail: "Empfängt Swan-Karten- und Adyen-Zahlungsevents.",
    status: "Bereit",
  },
  {
    name: "POS / E-Commerce API",
    detail: "Rewards aus externen Checkout-Systemen ausgeben und einlösen.",
    status: "Bereit",
  },
  {
    name: "Affiliate-Netzwerke",
    detail: "Provisionsfinanzierte Rewards als pending oder approved verfolgen.",
    status: "Konfigurieren",
  },
];

function IntegrationsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Zoryn Rewards</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Integrationen</h1>
        <p className="mt-2 text-muted-foreground">
          Rewards standalone betreiben oder Banking, Payments, POS und LoungeTech anbinden.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {INTEGRATIONS.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <PlugZap className="size-5 text-primary" />
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {item.status}
              </span>
            </div>
            <h2 className="mt-5 font-semibold">{item.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" />
              <span>Signierte Events und Idempotenz</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-primary" />
          <h2 className="font-semibold">Anbieterunabhängig by design</h2>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Rewards besitzt Programmregeln und den Ledger. Zoryn Money und ZorynPay senden
          normalisierte Events — Swan oder Adyen lassen sich austauschen, ohne die Loyalty-Logik neu
          zu schreiben.
        </p>
        <p className="mt-4 rounded-xl bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
          POST /api/public/rewards/events · Header: x-zoryn-signature (HMAC-SHA256)
        </p>
      </div>
    </div>
  );
}
