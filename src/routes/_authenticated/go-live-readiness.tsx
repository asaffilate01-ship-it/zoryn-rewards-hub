import { createFileRoute } from "@tanstack/react-router";
import { PlatformShell } from "@/components/PlatformShell";
import { GoLiveReadinessCentre } from "@/features/go-live/GoLiveReadinessCentre";

const description =
  "Onboarding-Status, verfügbare Deckung, Haftungsquote und Betriebswarnungen für den kontrollierten Pilotstart.";

export const Route = createFileRoute("/_authenticated/go-live-readiness")({
  component: GoLiveReadinessPage,
  head: () => ({
    meta: [
      { title: "Go-Live Readiness Centre – Zoryn" },
      { name: "description", content: description },
      { property: "og:title", content: "Go-Live Readiness Centre – Zoryn" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function GoLiveReadinessPage() {
  return (
    <PlatformShell eyebrow="Operations" title="Go-Live Readiness" description={description}>
      <GoLiveReadinessCentre />
    </PlatformShell>
  );
}
