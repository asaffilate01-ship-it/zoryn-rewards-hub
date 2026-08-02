import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, ShieldCheck, WalletCards } from "lucide-react";
import { getGoLiveOverview } from "@/lib/go-live.functions";
import { useT } from "@/lib/i18n";

function euro(minor = 0) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(minor / 100);
}

export function GoLiveReadinessCentre() {
  const t = useT();
  const [tenantId, setTenantId] = useState<string | undefined>(undefined);
  const overviewFn = useServerFn(getGoLiveOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["go-live-readiness", tenantId ?? "default"],
    queryFn: () => overviewFn({ data: tenantId ? { tenantId } : {} }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  if (!data) return null;

  if (!data.tenantId) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("Kein Mandant verfügbar. Lege zuerst einen Rewards-Mandanten an.")}
      </p>
    );
  }

  const funding = data.liability?.fundingAvailableMinor ?? 0;
  const exposure =
    (data.liability?.universalPointsMinor ?? 0) +
    (data.liability?.cashbackMinor ?? 0) +
    (data.liability?.giftCreditMinor ?? 0) +
    (data.liability?.redemptionPayableMinor ?? 0);
  const coverage = exposure > 0 ? funding / exposure : 1;

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

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border/60 bg-card p-5">
          <WalletCards className="h-5 w-5 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">{t("Verfügbare Deckung")}</p>
          <p className="text-2xl font-semibold">{euro(funding)}</p>
        </article>
        <article className="rounded-2xl border border-border/60 bg-card p-5">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">{t("Haftungsdeckung")}</p>
          <p className="text-2xl font-semibold">{Math.round(coverage * 100)}%</p>
          <p className="text-xs text-muted-foreground">
            {t("Offene Verbindlichkeiten")}: {euro(exposure)}
          </p>
        </article>
        <article className="rounded-2xl border border-border/60 bg-card p-5">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="mt-4 text-sm text-muted-foreground">{t("Offene Warnungen")}</p>
          <p className="text-2xl font-semibold">{data.alerts.length}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">{t("Händler-Onboarding")}</h2>
        </div>
        <p className="mt-3 text-sm">
          {t("Aktueller Status")}: <strong>{data.onboarding?.status ?? t("nicht gestartet")}</strong>
        </p>
        {data.onboarding?.legalName && (
          <p className="text-xs text-muted-foreground">{data.onboarding.legalName}</p>
        )}
        {(data.onboarding?.requiredActions.length ?? 0) > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {data.onboarding?.requiredActions.map((action) => <li key={action}>{action}</li>)}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-semibold">{t("Betriebswarnungen")}</h2>
        <div className="mt-4 space-y-2">
          {data.alerts.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("Keine offenen Warnungen.")}</p>
          )}
          {data.alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-xl border border-border/60 p-3"
            >
              <div>
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.alertType}</p>
              </div>
              <span
                className={`rounded-full border px-2 py-1 text-xs capitalize ${
                  alert.severity === "critical"
                    ? "border-destructive/50 text-destructive"
                    : alert.severity === "warning"
                      ? "border-amber-500/50 text-amber-500"
                      : "border-border/60 text-muted-foreground"
                }`}
              >
                {alert.severity}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
