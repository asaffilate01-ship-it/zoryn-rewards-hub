import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { merchantOverview } from "@/lib/merchant-portal.functions";
import { useActiveMerchantId } from "@/lib/active-merchant";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/merchant/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const t = useT();
  const merchantId = useActiveMerchantId();
  const overviewFn = useServerFn(merchantOverview);
  const { data } = useQuery({
    queryKey: ["merchantOverview", merchantId],
    queryFn: () => overviewFn({ data: { merchantId: merchantId! } }),
    enabled: !!merchantId,
  });

  if (!merchantId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-muted-foreground">{t("Kein Merchant ausgewählt")}</p>
          <Link to="/merchant">
            <Button>{t("Merchant wählen")}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const m = data?.merchant;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">{t("Einstellungen")}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Merchant-Profil")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <Row label={t("Name")} value={m?.name} />
          <Row label={t("Slug")} value={m?.slug} />
          <Row label={t("Kategorie")} value={m?.category ?? "—"} />
          <Row label={t("Punkte pro Euro")} value={m ? String(m.points_per_euro) : "—"} />
          <Row label={t("Aktiv")} value={m ? (m.is_active ? t("Ja") : t("Nein")) : "—"} />
          <Row label={t("Brand-Farbe")} value={m?.brand_color ?? "—"} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Letzte Transaktionen")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(data?.transactions ?? []).map((tr) => (
            <div
              key={tr.id}
              className="flex items-center justify-between border-b border-border/50 py-2 last:border-none"
            >
              <div>
                <div className="font-medium">
                  {tr.kind === "earn" ? t("Gutschrift") : t("Einlösung")}
                </div>
                {tr.memo && <div className="text-xs text-muted-foreground">{tr.memo}</div>}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(tr.created_at).toLocaleString("de-DE")}
              </div>
            </div>
          ))}
          {(!data || data.transactions.length === 0) && (
            <p className="text-muted-foreground">{t("Noch keine Umsätze.")}</p>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        {t("Editieren des Profils folgt bald. Aktuell read-only.")}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
