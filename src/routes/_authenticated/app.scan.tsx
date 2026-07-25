import { createFileRoute } from "@tanstack/react-router";
import { QrCode } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/scan")({
  head: () => ({ meta: [{ title: "Scannen — Zoryn" }] }),
  component: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <QrCode className="mx-auto size-8 text-brand-soft" />
      <div className="mt-3 font-semibold">QR-Scanner</div>
      <p className="mt-1 text-sm text-muted-foreground">
        Kamerabasiertes Sammeln folgt in Phase 3 zusammen mit dem Merchant-Portal.
      </p>
    </div>
  ),
});
