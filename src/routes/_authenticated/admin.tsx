import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminOverview, isAdmin } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZorynMark } from "@/components/ZorynMark";
import { Shield, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Zoryn" }] }),
  component: AdminPage,
});

function AdminPage() {
  const isAdminFn = useServerFn(isAdmin);
  const overviewFn = useServerFn(adminOverview);
  const { data: allowed, isLoading: gateLoading } = useQuery({ queryKey: ["isAdmin"], queryFn: () => isAdminFn() });
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminOverview"], queryFn: () => overviewFn(), enabled: allowed === true,
  });

  if (gateLoading) return <div className="p-8 text-sm text-muted-foreground">Prüfe Berechtigungen…</div>;
  if (!allowed) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <Shield className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-3 font-display text-xl font-semibold">Kein Admin-Zugriff</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dieser Bereich ist Plattform-Administrator:innen vorbehalten.
        </p>
        <Link to="/app" className="mt-6 inline-block"><Button variant="secondary">Zurück zum Wallet</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/admin" className="flex items-center gap-2">
            <ZorynMark size={26} />
            <span className="font-display font-semibold">Zoryn Admin</span>
          </Link>
          <Link to="/app"><Button variant="ghost" size="sm"><ArrowLeft className="mr-1 size-4" /> App</Button></Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">Plattform-Übersicht</h1>
          <p className="text-sm text-muted-foreground">Letzte 30 Tage.</p>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Laden…</div>}
        {error && <div className="text-sm text-destructive">{error instanceof Error ? error.message : "Fehler"}</div>}

        {data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Nutzer:innen" value={data.total_users} />
            <Stat label="Aktive Merchants" value={data.active_merchants} />
            <Stat label="Aktive Angebote" value={data.active_offers} />
            <Stat label="Transaktionen (30 T)" value={data.transactions_30d} />
            <Stat label="Punkte ausgegeben (30 T)" value={data.points_issued_30d} accent />
            <Stat label="Punkte eingelöst (30 T)" value={data.points_redeemed_30d} />
            <Stat label="Punkte-Verbindlichkeit" value={`${(data.total_liability_points / 100).toFixed(2)} €`} accent />
            <Stat label="Offene Fälle" value={data.open_claims} />
          </div>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Nächste Schritte</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>• Merchant-Onboarding-Queue (Phase 5)</div>
            <div>• Fraud- & Compliance-Queues (Phase 5)</div>
            <div>• Settlement & Reconciliation (Phase 7)</div>
            <div>• Card-linked / Open Banking (Phase 8)</div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <Card className={accent ? "border-brand/40 bg-brand/5" : ""}>
      <CardContent className="py-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
