import { createFileRoute } from "@tanstack/react-router";
import { PlatformShell } from "@/components/PlatformShell";
import { RewardsV4Centre } from "@/features/rewards-v4/components/RewardsV4Centre";

export const Route = createFileRoute("/_authenticated/rewards-v4")({
  component: RewardsV4Page,
  head: () => ({
    meta: [
      { title: "Rewards V4 Centre – Zoryn" },
      {
        name: "description",
        content:
          "Wallet-Salden, geführter Kampagnen-Assistent und Sicherheits-Cockpit in einem Arbeitsbereich.",
      },
      { property: "og:title", content: "Rewards V4 Centre – Zoryn" },
      {
        property: "og:description",
        content:
          "Wallet-Salden, geführter Kampagnen-Assistent und Sicherheits-Cockpit in einem Arbeitsbereich.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function RewardsV4Page() {
  return (
    <PlatformShell
      eyebrow="Rewards V4"
      title="Wallet, Kampagnen und Sicherheit in einem Cockpit."
      description="Klare Salden, ein geführter Kampagnen-Assistent und Risiko-Monitoring – alles server-seitig abgesichert."
    >
      <RewardsV4Centre />
    </PlatformShell>
  );
}
