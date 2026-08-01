import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, RefreshCw, Wallet, Users } from "lucide-react";
import { tenantOverview, retryRewardEvent } from "@/lib/integrations.functions";

export const Route = createFileRoute("/_authenticated/admin/tenants")({
  head: () => ({
    meta: [
      { title: "Tenants & Events — Zoryn Admin" },
      {
        name: "description",
        content:
          "Mandanten, Programme, Wallets und eingehende Reward-Events der Zoryn-Plattform überwachen.",
      },
      { property: "og:title", content: "Tenants & Events — Zoryn Admin" },
      {
        property: "og:description",
        content: "Multi-Tenant-Übersicht und Event-Verarbeitung im Zoryn Admin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TenantsPage,
});

const statusTone: Record<string, string> = {
  processed: "border-primary/40 bg-primary/10 text-primary",
  received: "border-border/70 bg-card/60 text-muted-foreground",
  processing: "border-border/70 bg-card/60 text-muted-foreground",
  ignored: "border-border/70 bg-muted/40 text-muted-foreground",
  failed: "border-destructive/40 bg-destructive/10 text-destructive",
};

function TenantsPage() {
  const load = useServerFn(tenantOverview);
  const retry = useServerFn(retryRewardEvent);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["tenantOverview"], queryFn: () => load() });

  const retryMutation = useMutation({
    mutationFn: (eventId: string) => retry({ data: { eventId } }),
    onSuccess: (res) => {
      if (res?.ok) toast.success(`Event verarbeitet (+${res.amount ?? 0})`);
      else toast.error(res?.reason ?? "Verarbeitung fehlgeschlagen");
      void qc.invalidateQueries({ queryKey: ["tenantOverview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Lade Mandanten…</p>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Tenants & Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Multi-Tenant-Architektur: Programme, Wallets und eingehende Partner-Events.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {(data?.tenants ?? []).map((t) => (
          <article key={t.id} className="rounded-2xl border border-border/60 bg-card/60 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </span>
                <div>
                  <p className="font-display text-[15px] font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{t.slug} · {t.mode}
                  </p>
                </div>
              </div>
              <Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge>
            </div>
            <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                { k: "Programme", v: t.programmes },
                { k: "Merchants", v: t.merchants },
                { k: "Mitglieder", v: t.memberships },
                { k: "Wallets", v: t.wallets },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-border/50 bg-background/40 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.k}
                  </dt>
                  <dd className="font-display text-base font-semibold">{s.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wallet className="size-3.5" /> Verfügbar gesamt:{" "}
              <span className="font-medium text-foreground">
                {t.available.toLocaleString("de-DE")}
              </span>
            </p>
          </article>
        ))}
        {(data?.tenants ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Noch keine Mandanten angelegt.</p>
        )}
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/60">
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
          <Users className="size-4 text-primary" />
          <h2 className="font-display text-sm font-semibold">Eingehende Events</h2>
        </div>
        <div className="divide-y divide-border/50">
          {(data?.events ?? []).map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {e.provider} · {e.event_type}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.provider_event_id}
                  {e.amount_cents != null && ` · ${(e.amount_cents / 100).toFixed(2)} €`}
                  {e.error && ` · ${e.error}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                    statusTone[e.status] ?? statusTone.received
                  }`}
                >
                  {e.status}
                </span>
                {e.status !== "processed" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={retryMutation.isPending}
                    onClick={() => retryMutation.mutate(e.id)}
                  >
                    <RefreshCw className="size-3.5" /> Retry
                  </Button>
                )}
              </div>
            </div>
          ))}
          {(data?.events ?? []).length === 0 && (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              Noch keine Events empfangen. Partner senden an{" "}
              <code className="rounded bg-muted/60 px-1">POST /api/public/rewards/events</code>.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
