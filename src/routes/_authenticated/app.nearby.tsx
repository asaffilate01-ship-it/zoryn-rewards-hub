import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/nearby")({
  head: () => ({ meta: [{ title: "In der Nähe — Zoryn" }] }),
  component: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <MapPin className="mx-auto size-8 text-brand-soft" />
      <div className="mt-3 font-semibold">In der Nähe</div>
      <p className="mt-1 text-sm text-muted-foreground">
        PostGIS-Karte mit lokalen Angeboten kommt in Phase 4.
      </p>
    </div>
  ),
});
