import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { merchantOverview } from "@/lib/merchant-portal.functions";
import { useActiveMerchantId } from "@/lib/active-merchant";

export const Route = createFileRoute("/_authenticated/merchant/team")({
  component: TeamPage,
});

function TeamPage() {
  const merchantId = useActiveMerchantId();
  const overviewFn = useServerFn(merchantOverview);
  const { data } = useQuery({
    queryKey: ["merchantOverview", merchantId],
    queryFn: () => overviewFn({ data: { merchantId: merchantId! } }),
    enabled: !!merchantId,
  });

  if (!merchantId) {
    return (
      <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground">Kein Merchant ausgewählt</p>
        <Link to="/merchant"><Button>Merchant wählen</Button></Link>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Team</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Mitglieder</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(data?.members ?? []).map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-border/50 py-2 last:border-none">
              <span className="font-mono text-xs">{m.user_id}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase">{m.role}</span>
            </div>
          ))}
          {(!data || data.members.length === 0) && <p className="text-muted-foreground">Noch keine Mitglieder.</p>}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Team-Einladungen per E-Mail folgen in einer der nächsten Phasen.
      </p>
    </div>
  );
}
