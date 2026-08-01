import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useActiveMerchantId } from "@/lib/active-merchant";
import {
  fundingOverview,
  depositFunds,
  listSettlements,
  computeSettlement,
} from "@/lib/settlements.functions";
import { Wallet, TrendingUp, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/merchant/funding")({
  component: FundingPage,
});

function FundingPage() {
  const merchantId = useActiveMerchantId();
  const qc = useQueryClient();
  const overviewFn = useServerFn(fundingOverview);
  const settlementsFn = useServerFn(listSettlements);
  const depositFn = useServerFn(depositFunds);
  const computeFn = useServerFn(computeSettlement);

  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const { data: overview } = useQuery({
    queryKey: ["funding", merchantId],
    queryFn: () => overviewFn({ data: { merchantId: merchantId! } }),
    enabled: !!merchantId,
  });
  const { data: settlements } = useQuery({
    queryKey: ["settlements", merchantId],
    queryFn: () => settlementsFn({ data: { merchantId: merchantId! } }),
    enabled: !!merchantId,
  });

  const deposit = useMutation({
    mutationFn: () =>
      depositFn({
        data: {
          merchantId: merchantId!,
          amountCents: Math.round(Number(amount) * 100),
          memo: memo || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Guthaben aufgeladen");
      setAmount("");
      setMemo("");
      qc.invalidateQueries({ queryKey: ["funding", merchantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const compute = useMutation({
    mutationFn: (periodStart: string) =>
      computeFn({ data: { merchantId: merchantId!, periodStart } }),
    onSuccess: () => {
      toast.success("Abrechnung aktualisiert");
      qc.invalidateQueries({ queryKey: ["settlements", merchantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!merchantId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-muted-foreground">Kein Merchant ausgewählt</p>
          <Link to="/merchant">
            <Button>Merchant wählen</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const balanceEuro = (overview?.balance_cents ?? 0) / 100;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Guthaben & Abrechnung</h1>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="flex items-center gap-4 py-6">
          <div className="rounded-xl bg-primary/20 p-3">
            <Wallet className="size-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Aktuelles Guthaben</div>
            <div className="font-display text-3xl font-semibold">
              {balanceEuro.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Guthaben aufladen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <div>
              <Label htmlFor="amount">Betrag (€)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
              />
            </div>
            <div>
              <Label htmlFor="memo">Notiz</Label>
              <Input
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => deposit.mutate()}
                disabled={!amount || Number(amount) <= 0 || deposit.isPending}
                className="w-full"
              >
                Aufladen
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Simulation — im Live-Betrieb via Zahlungsanbieter.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Monatsabrechnungen</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => compute.mutate(currentMonth)}
            disabled={compute.isPending}
          >
            <TrendingUp className="mr-1 size-4" /> Aktuellen Monat berechnen
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(settlements ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Noch keine Abrechnungen.</p>
          )}
          {(settlements ?? []).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {new Date(s.period_start).toLocaleDateString("de-DE", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ausgegeben: {s.points_issued.toLocaleString("de-DE")} · Eingelöst:{" "}
                    {s.points_redeemed.toLocaleString("de-DE")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono font-semibold">
                    {(s.net_liability_cents / 100).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">Netto-Haftung</div>
                </div>
                <Badge
                  variant={
                    s.status === "open"
                      ? "secondary"
                      : s.status === "closed"
                        ? "default"
                        : "outline"
                  }
                >
                  {s.status === "open"
                    ? "Offen"
                    : s.status === "closed"
                      ? "Abgeschlossen"
                      : "Bezahlt"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Guthaben-Historie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(overview?.ledger ?? []).length === 0 && (
            <p className="text-muted-foreground">Noch keine Bewegungen.</p>
          )}
          {(overview?.ledger ?? []).map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between border-b border-border/50 py-2 last:border-none"
            >
              <div>
                <div className="font-medium">{l.memo ?? l.kind}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleString("de-DE")}
                </div>
              </div>
              <div className="font-mono font-semibold text-primary">
                +
                {(l.amount_cents / 100).toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
