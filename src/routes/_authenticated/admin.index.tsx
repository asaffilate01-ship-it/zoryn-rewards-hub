import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminOverview } from "@/lib/admin.functions";
import { IntegrationHealthCard } from "@/components/IntegrationHealthCard";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const overviewFn = useServerFn(adminOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminOverview"],
    queryFn: () => overviewFn(),
  });

  return (
    <>
      <div>
        <h1 className="font-display text-2xl font-semibold">Plattform-Übersicht</h1>
        <p className="text-sm text-muted-foreground">Letzte 30 Tage.</p>
      </div>
      {isLoading && <div className="text-sm text-muted-foreground">Laden…</div>}
      {error && (
        <div className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Fehler"}
        </div>
      )}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Nutzer:innen" value={data.total_users} />
          <Stat label="Aktive Merchants" value={data.active_merchants} />
          <Stat label="Aktive Angebote" value={data.active_offers} />
          <Stat label="Transaktionen (30 T)" value={data.transactions_30d} />
          <Stat label="Punkte ausgegeben (30 T)" value={data.points_issued_30d} accent />
          <Stat label="Punkte eingelöst (30 T)" value={data.points_redeemed_30d} />
          <Stat
            label="Punkte-Verbindlichkeit"
            value={`${(data.total_liability_points / 100).toFixed(2)} €`}
            accent
          />
          <Stat label="Offene Fälle" value={data.open_claims} />
        </div>
      )}
      <IntegrationHealthCard />
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "border-brand/40 bg-brand/5" : ""}>
      <CardContent className="py-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
