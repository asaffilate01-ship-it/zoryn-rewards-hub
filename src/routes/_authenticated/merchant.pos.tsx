import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Minus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lookupCustomer, merchantEarn, merchantRedeem, myMerchants } from "@/lib/merchant-portal.functions";
import { useActiveMerchantId, setActiveMerchantId } from "@/lib/active-merchant";

export const Route = createFileRoute("/_authenticated/merchant/pos")({
  component: PosPage,
});

function PosPage() {
  const merchantId = useActiveMerchantId();
  const listFn = useServerFn(myMerchants);
  const lookupFn = useServerFn(lookupCustomer);
  const earnFn = useServerFn(merchantEarn);
  const redeemFn = useServerFn(merchantRedeem);

  const { data: list } = useQuery({ queryKey: ["myMerchants"], queryFn: () => listFn() });
  const active = useMemo(() => list?.find((m) => m.merchant.id === merchantId), [list, merchantId]);

  const [membership, setMembership] = useState("");
  const [euro, setEuro] = useState("");
  const [memo, setMemo] = useState("");
  const [customer, setCustomer] = useState<null | { user_id: string; display_name: string; membership_number: string }>(null);

  const points = useMemo(() => {
    const e = Number(euro);
    if (!Number.isFinite(e) || e <= 0 || !active) return 0;
    return Math.round(e * active.merchant.points_per_euro);
  }, [euro, active]);

  const lookup = useMutation({
    mutationFn: async () => lookupFn({ data: { merchantId: merchantId!, membership } }),
    onSuccess: (c) => { setCustomer(c); toast.success(`Kunde: ${c.display_name}`); },
    onError: (e: unknown) => { setCustomer(null); toast.error(e instanceof Error ? e.message : "Nicht gefunden"); },
  });

  const earn = useMutation({
    mutationFn: async () => earnFn({ data: {
      merchantId: merchantId!, customerUserId: customer!.user_id,
      amount: points, idempotencyKey: crypto.randomUUID(), memo: memo || undefined,
    }}),
    onSuccess: () => { toast.success(`+${points} Punkte gutgeschrieben.`); reset(); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  const redeem = useMutation({
    mutationFn: async () => redeemFn({ data: {
      merchantId: merchantId!, customerUserId: customer!.user_id,
      amount: points, idempotencyKey: crypto.randomUUID(), memo: memo || undefined,
    }}),
    onSuccess: () => { toast.success(`-${points} Punkte eingelöst.`); reset(); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  function reset() { setEuro(""); setMemo(""); }

  if (!merchantId) {
    return (
      <EmptyState title="Kein Merchant ausgewählt" cta="Merchant wählen" to="/merchant" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Kasse</h1>
          <p className="text-sm text-muted-foreground">
            {active ? `${active.merchant.name} · ${active.merchant.points_per_euro} Punkte pro Euro` : "…"}
          </p>
        </div>
        <button className="text-xs text-muted-foreground underline-offset-4 hover:underline" onClick={() => setActiveMerchantId(null)}>
          Wechseln
        </button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">1. Kunde</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={membership} onChange={(e) => setMembership(e.target.value.toUpperCase())} placeholder="Mitgliedschaftsnummer (z.B. ZRN-ABCDEFGH)" />
            <Button variant="secondary" disabled={lookup.isPending || membership.length < 4} onClick={() => lookup.mutate()}>
              Suchen
            </Button>
          </div>
          {customer && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-3 text-sm">
              <User className="size-4" />
              <span className="font-medium">{customer.display_name}</span>
              <span className="text-muted-foreground">· {customer.membership_number}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">2. Betrag</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Umsatz in €">
              <Input type="number" min={0} step="0.01" value={euro} onChange={(e) => setEuro(e.target.value)} placeholder="12.50" />
            </Field>
            <Field label="Notiz (optional)">
              <Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Bon-Nr., Produkt…" />
            </Field>
          </div>
          <div className="text-sm text-muted-foreground">
            Ergibt <span className="text-foreground font-medium">{points}</span> Punkte
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          className="flex-1"
          disabled={!customer || points <= 0 || earn.isPending}
          onClick={() => earn.mutate()}
        >
          <Plus className="mr-1 size-4" /> Punkte gutschreiben
        </Button>
        <Button
          className="flex-1"
          variant="outline"
          disabled={!customer || points <= 0 || redeem.isPending}
          onClick={() => redeem.mutate()}
        >
          <Minus className="mr-1 size-4" /> Punkte einlösen
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function EmptyState({ title, cta, to }: { title: string; cta: string; to: string }) {
  return (
    <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-muted-foreground">{title}</p>
      <Link to={to}><Button>{cta}</Button></Link>
    </CardContent></Card>
  );
}
