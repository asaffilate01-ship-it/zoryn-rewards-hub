import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminSeries, adminTopMerchants } from "@/lib/analytics.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Zoryn Admin" }] }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const seriesFn = useServerFn(adminSeries);
  const topFn = useServerFn(adminTopMerchants);
  const { data: series } = useQuery({ queryKey: ["adminSeries"], queryFn: () => seriesFn() });
  const { data: top } = useQuery({ queryKey: ["adminTopMerchants"], queryFn: () => topFn() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Plattform-Analytics</h1>
        <p className="text-sm text-muted-foreground">30-Tage-Trends.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Punkte-Aktivität & Registrierungen</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series ?? []}>
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
              <Legend />
              <Line
                type="monotone"
                dataKey="earned"
                stroke="hsl(var(--primary))"
                name="Ausgegeben"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="redeemed"
                stroke="hsl(var(--destructive))"
                name="Eingelöst"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="new_users"
                stroke="hsl(var(--accent))"
                name="Neue Nutzer:innen"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top-Merchants (30 Tage)</CardTitle>
        </CardHeader>
        <CardContent>
          {(top ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Aktivität.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {(top ?? []).map((m) => (
                <li key={m.merchant_id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">/{m.slug}</div>
                  </div>
                  <div className="text-right tabular-nums text-muted-foreground">
                    <div>{Number(m.earned).toLocaleString("de-DE")} P ausgegeben</div>
                    <div className="text-xs">{Number(m.txns)} Transaktionen</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
