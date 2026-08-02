import { createFileRoute } from "@tanstack/react-router";
import { PlatformShell } from "@/components/PlatformShell";
import { FinalLaunchCentre } from "@/features/launch/FinalLaunchCentre";

const description =
  "Startfreigabe, Monitoring-Prüfungen, Mobilgeräte und geplante Jobs für den finalen Launch an einem Ort.";

export const Route = createFileRoute("/_authenticated/final-launch")({
  component: FinalLaunchPage,
  head: () => ({
    meta: [
      { title: "Final Launch – Zoryn Rewards" },
      { name: "description", content: description },
      { property: "og:title", content: "Final Launch – Zoryn Rewards" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function FinalLaunchPage() {
  return (
    <PlatformShell eyebrow="Launch" title="Final Launch" description={description}>
      <FinalLaunchCentre />
    </PlatformShell>
  );
}
