import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Scale } from "lucide-react";
import { getReconciliationOverview } from "@/lib/finalisation.functions";
import { useT } from "@/lib/i18n";
import { formatEuroCents } from "@/components/PlatformShell";

const statusTone: Record<string, string> = {
  passed: "border-primary/50 text-primary",
  running: "border-border/60 text-muted-foreground",
  warning: "border-amber-500/50 text-amber-500",
  failed: "border-destructive/50 text-destructive",
};

export function ReconciliationCentre() {
  const t = useT();
  const [tenantId, setTenantId] = useState<string | undefined>(undefined);
  const overviewFn = useServerFn(getReconciliationOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["reconciliation-overview", tenantId ?? "default"],
    queryFn: () => overviewFn({ data: tenantId ? { tenantId } : {} }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  if (!data) return null;

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
          <Scale className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">{t("Abstimmungsläufe")}</h2>
        </div>

        {data.runs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("Noch keine Abstimmungsläufe erfasst.")}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2">{t("Typ")}</th>
                  <th className="pb-2">{t("Status")}</th>
                  <th className="pb-2 text-right">{t("Erwartet")}</th>
                  <th className="pb-2 text-right">{t("Ist")}</th>
                  <th className="pb-2 text-right">{t("Differenz")}</th>
                  <th className="pb-2 text-right">{t("Gestartet")}</th>
                </tr>
              </thead>
              <tbody>
                {data.runs.map((run) => (
                  <tr key={run.id} className="border-t border-border/60">
                    <td className="py-2.5">{run.runType}</td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs capitalize ${
                          statusTone[run.status] ?? "border-border/60 text-muted-foreground"
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">{formatEuroCents(run.expectedMinor)}</td>
                    <td className="py-2.5 text-right">{formatEuroCents(run.actualMinor)}</td>
                    <td
                      className={`py-2.5 text-right ${
                        run.differenceMinor === 0 ? "" : "text-destructive"
                      }`}
                    >
                      {formatEuroCents(run.differenceMinor)}
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">
                      {new Date(run.startedAt).toLocaleString("de-DE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
