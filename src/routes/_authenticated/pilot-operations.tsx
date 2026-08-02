import { createFileRoute } from "@tanstack/react-router";
import { PlatformShell } from "@/components/PlatformShell";
import { PilotOperationsCentre } from "@/features/pilot/PilotOperationsCentre";

const description =
  "Jobläufe, Support- und Beschwerdefälle, Betriebswarnungen und Backup-Nachweise für den Pilotbetrieb an einem Ort.";

export const Route = createFileRoute("/_authenticated/pilot-operations")({
  component: PilotOperationsPage,
  head: () => ({
    meta: [
      { title: "Pilot Operations – Zoryn Rewards" },
      { name: "description", content: description },
      { property: "og:title", content: "Pilot Operations – Zoryn Rewards" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function PilotOperationsPage() {
  return (
    <PlatformShell eyebrow="Operations" title="Pilot Operations" description={description}>
      <PilotOperationsCentre />
    </PlatformShell>
  );
}
