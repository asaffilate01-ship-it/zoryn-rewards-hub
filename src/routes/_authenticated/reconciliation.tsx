import { createFileRoute } from "@tanstack/react-router";
import { PlatformShell } from "@/components/PlatformShell";
import { ReconciliationCentre } from "@/features/operations/ReconciliationCentre";

const description =
  "Tägliche Abstimmung von Haftung, Händlerdeckung, Settlement und Affiliate mit Soll-Ist-Differenzen.";

export const Route = createFileRoute("/_authenticated/reconciliation")({
  component: ReconciliationPage,
  head: () => ({
    meta: [
      { title: "Abstimmung & Reconciliation – Zoryn" },
      { name: "description", content: description },
      { property: "og:title", content: "Abstimmung & Reconciliation – Zoryn" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ReconciliationPage() {
  return (
    <PlatformShell eyebrow="Operations" title="Abstimmung" description={description}>
      <ReconciliationCentre />
    </PlatformShell>
  );
}
