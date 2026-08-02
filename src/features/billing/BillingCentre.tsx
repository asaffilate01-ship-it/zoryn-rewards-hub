import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Sparkles } from "lucide-react";
import { getBillingOverview } from "@/lib/finalisation.functions";
import { useT } from "@/lib/i18n";
import { formatEuroCents } from "@/components/PlatformShell";

export function BillingCentre() {
  const t = useT();
  const [tenantId, setTenantId] = useState<string | undefined>(undefined);
  const overviewFn = useServerFn(getBillingOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["billing-overview", tenantId ?? "default"],
    queryFn: () => overviewFn({ data: tenantId ? { tenantId } : {} }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  if (!data) return null;

  const activePlanId = data.subscription?.planId ?? null;

  return (
    <div className="space-y-6">
      {data.tenants.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {data.tenants.map((tenant) => (
            <button
              key={tenant.id}
              type="button"
              onClick={() => setTenantId(tenant.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tenant.id === data.tenantId
                  ? "gradient-brand text-primary-foreground"
                  : "border border-border/60 bg-card/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tenant.name}
            </button>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">{t("Aktuelles Abonnement")}</h2>
        </div>
        {data.subscription ? (
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <p>
              {t("Status")}: <strong className="capitalize">{data.subscription.status}</strong>
            </p>
            <p className="text-muted-foreground">
              {t("Laufzeitende")}:{" "}
              {data.subscription.currentPeriodEnd
                ? new Date(data.subscription.currentPeriodEnd).toLocaleDateString("de-DE")
                : "—"}
            </p>
            <p className="text-muted-foreground">
              {t("Kündigung zum Periodenende")}:{" "}
              {data.subscription.cancelAtPeriodEnd ? t("ja") : t("nein")}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {t("Noch kein Abonnement aktiv – wähle unten einen Tarif.")}
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {data.plans.map((plan) => {
          const active = plan.id === activePlanId;
          return (
            <article
              key={plan.id}
              className={`rounded-2xl border bg-card p-5 ${
                active ? "border-primary/60 shadow-sm" : "border-border/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {active && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 px-2 py-0.5 text-xs text-primary">
                    <Check className="h-3 w-3" /> {t("aktiv")}
                  </span>
                )}
              </div>
              <p className="font-display mt-2 text-3xl font-semibold tracking-tight">
                {formatEuroCents(plan.monthlyPriceMinor)}
                <span className="text-sm font-normal text-muted-foreground"> / {t("Monat")}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {t("Jährlich")}: {formatEuroCents(plan.annualPriceMinor)}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li>
                  {plan.locationLimit ?? t("Unbegrenzt")} {t("Standorte")}
                </li>
                <li>
                  {plan.staffLimit ?? t("Unbegrenzt")} {t("Mitarbeitende")}
                </li>
                <li>
                  {plan.campaignLimit ?? t("Unbegrenzt")} {t("Kampagnen")}
                </li>
                <li>
                  {(plan.apiRequestLimit ?? 0).toLocaleString("de-DE")} {t("API-Aufrufe / Monat")}
                </li>
                <li>
                  {plan.whiteLabelEnabled ? t("White-Label inklusive") : t("Ohne White-Label")}
                </li>
              </ul>
            </article>
          );
        })}
      </section>
    </div>
  );
}
