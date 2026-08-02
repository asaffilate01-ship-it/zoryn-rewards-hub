import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { formatEuroCents, formatNumber } from "@/components/PlatformShell";
import type { RewardsV4Overview } from "@/lib/rewards-v4.functions";
import { useT } from "@/lib/i18n";

function Balance({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function RewardsWalletV4({ data }: { data: RewardsV4Overview }) {
  const t = useT();
  const w = data.wallet;
  const totalBreakdown = data.breakdown.reduce((a, b) => a + b.points, 0) || 1;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Balance
          label={t("Verfügbar")}
          value={formatNumber(w.availablePoints)}
          hint={formatEuroCents(w.availablePoints)}
        />
        <Balance
          label={t("Ausstehend")}
          value={formatNumber(w.pendingPoints)}
          hint={t("Wird nach Freigabe gutgeschrieben")}
        />
        <Balance
          label={t("Cashback")}
          value={formatEuroCents(w.cashbackCents)}
          hint={t("Auszahlbar")}
        />
        <Balance
          label={t("Geschenkguthaben")}
          value={formatEuroCents(w.giftCreditCents)}
          hint={t("Gift Cards & Gutscheine")}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link to="/app/scan">{t("Punkte sammeln")}</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/app/rewards">{t("Einlösen")}</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/app/offers">{t("Angebote")}</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("Reward-Verlauf")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.activity.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("Noch keine Bewegungen.")}</p>
            )}
            {data.activity.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium capitalize">{a.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.description ?? new Date(a.occurredAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${a.points >= 0 ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {a.points >= 0 ? "+" : ""}
                    {formatNumber(a.points)}
                  </p>
                  <Badge variant="outline" className="mt-0.5 text-[10px]">
                    {a.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Nach Quelle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.breakdown.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("Keine Daten.")}</p>
            )}
            {data.breakdown.map((b) => (
              <div key={b.source}>
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize text-muted-foreground">
                    {b.source.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium">{formatNumber(b.points)}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full gradient-brand"
                    style={{ width: `${Math.min(100, (b.points / totalBreakdown) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {data.stampCards.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("Stempelkarten")}
                </p>
                {data.stampCards.map((s) => (
                  <div key={s.id} className="rounded-xl border border-border/50 bg-card/40 p-3">
                    <p className="text-sm font-medium">{s.programme}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.current}/{s.required} · {s.reward}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
