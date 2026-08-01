import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useActiveMerchantId } from "@/lib/active-merchant";
import { merchantSeries, merchantTopCustomers } from "@/lib/analytics.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/merchant/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Zoryn Business" }] }),
  component: MerchantAnalytics,
});

function MerchantAnalytics() {
  const t = useT();
  const merchantId = useActiveMerchantId();
  const seriesFn = useServerFn(merchantSeries);
  const topFn = useServerFn(merchantTopCustomers);
  const { data: series } = useQuery({
    queryKey: ["merchantSeries", merchantId],
    queryFn: () => seriesFn({ data: { merchantId: merchantId! } }),
    enabled: !!merchantId,
  });
  const { data: top } = useQuery({
    queryKey: ["merchantTop", merchantId],
    queryFn: () => topFn({ data: { merchantId: merchantId! } }),
    enabled: !!merchantId,
  });

  if (!merchantId)
    return (
      <p className="text-sm text-muted-foreground">{t("Bitte wähle zuerst ein Geschäft aus.")}</p>
    );

  const totalEarned = (series ?? []).reduce((s, r) => s + Number(r.earned), 0);
  const totalRedeemed = (series ?? []).reduce((s, r) => s + Number(r.redeemed), 0);
  const totalTxns = (series ?? []).reduce((s, r) => s + Number(r.txn_count ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">{t("Letzte 30 Tage.")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t("Punkte ausgegeben")} value={totalEarned.toLocaleString("de-DE")} />
        <Stat label={t("Punkte eingelöst")} value={totalRedeemed.toLocaleString("de-DE")} />
        <Stat label={t("Transaktionen")} value={totalTxns.toLocaleString("de-DE")} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Punkte pro Tag")}</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series ?? []}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) => String(d).slice(5)}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Area type="monotone" dataKey="earned" stroke="hsl(var(--primary))" fill="url(#g1)" />
              <Area
                type="monotone"
                dataKey="redeemed"
                stroke="hsl(var(--destructive))"
                fill="url(#g2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Top-Kund:innen (30 Tage)")}</CardTitle>
        </CardHeader>
        <CardContent>
          {(top ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("Noch keine Aktivität.")}</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {(top ?? []).map((c) => (
                <li key={c.user_id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium">{c.display_name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {Number(c.earned).toLocaleString("de-DE")} P · {c.visits} {t("Besuche")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
