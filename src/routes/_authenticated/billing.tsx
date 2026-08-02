import { createFileRoute } from "@tanstack/react-router";
import { PlatformShell } from "@/components/PlatformShell";
import { BillingCentre } from "@/features/billing/BillingCentre";

const description =
  "Tarife, Limits und Abonnementstatus für Starter, Growth und Pro – inklusive Laufzeit und Kündigungsstatus.";

export const Route = createFileRoute("/_authenticated/billing")({
  component: BillingPage,
  head: () => ({
    meta: [
      { title: "Plan & Abrechnung – Zoryn" },
      { name: "description", content: description },
      { property: "og:title", content: "Plan & Abrechnung – Zoryn" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function BillingPage() {
  return (
    <PlatformShell eyebrow="Commercial" title="Plan & Abrechnung" description={description}>
      <BillingCentre />
    </PlatformShell>
  );
}
