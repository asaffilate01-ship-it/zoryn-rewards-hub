import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Sparkles } from "lucide-react";
import { listActiveOffers } from "@/lib/nearby.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/app/offers")({
  head: () => ({ meta: [{ title: "Angebote — Zoryn" }] }),
  component: OffersPage,
});

function OffersPage() {
  const t = useT();
  const fn = useServerFn(listActiveOffers);
  const { data } = useQuery({ queryKey: ["offers"], queryFn: () => fn() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{t("Angebote")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("Aktive Bonus-Aktionen bei Zoryn-Partnern.")}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(data ?? []).map((o) => (
          <Card key={o.id} className="overflow-hidden">
            <CardContent className="space-y-2 py-5">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {(o.merchant as { name: string } | null)?.name ?? "—"}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-xs text-brand-soft">
                  <Flame className="size-3" /> {Number(o.reward_multiplier).toFixed(1)}×
                </span>
              </div>
              <div className="font-semibold">{o.title}</div>
              {o.description && <p className="text-sm text-muted-foreground">{o.description}</p>}
              <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                {o.bonus_points > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="size-3" />+{o.bonus_points} {t("Bonuspunkte")}
                  </span>
                )}
                {o.min_spend_cents > 0 && (
                  <span>
                    {t("Min.")} €{(o.min_spend_cents / 100).toFixed(2)}
                  </span>
                )}
                {o.ends_at && (
                  <span>
                    {t("bis")} {new Date(o.ends_at).toLocaleDateString("de-DE")}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {data && data.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {t("Aktuell keine Angebote.")}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
