import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import type { RewardsV4Overview } from "@/lib/rewards-v4.functions";
import { useT } from "@/lib/i18n";

const CONTROLS = [
  "Server-only Reward-Aktionen",
  "Rollenprüfung je Mandant",
  "Idempotenz-Schutz",
  "Signierte Webhooks (HMAC)",
  "Zeitstempel- & Replay-Schutz",
  "Duplikat-Erkennung",
  "Einmalige QR-Challenges",
  "Keine Browser-Schreibrechte auf sensible Tabellen",
  "Mandanten-basierte Row Level Security",
  "Unveränderliche Ledger-Grenze",
] as const;

function severityVariant(sev: string) {
  if (sev === "critical" || sev === "high") return "destructive" as const;
  if (sev === "medium") return "default" as const;
  return "secondary" as const;
}

export function SecurityCentreV4({ data }: { data: RewardsV4Overview }) {
  const t = useT();
  const open = data.securityEvents.filter((e) => e.status !== "resolved");

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            {t("Risiko-Warnungen")}
            <Badge variant="outline">{open.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.securityEvents.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("Keine Auffälligkeiten.")}</p>
          )}
          {data.securityEvents.map((e) => (
            <div key={e.id} className="rounded-xl border border-border/50 bg-card/40 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium capitalize">{e.eventType.replace(/_/g, " ")}</p>
                <Badge variant={severityVariant(e.severity)}>{e.severity}</Badge>
                <Badge variant="outline">{e.status}</Badge>
                <span className="text-xs text-muted-foreground">
                  {t("Risiko")} {e.riskScore}
                </span>
              </div>
              {e.reasons.length > 0 && (
                <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                  {e.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                {new Date(e.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {t("Sicherheits-Kontrollen")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CONTROLS.map((c) => (
            <div
              key={c}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/40 px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">{t(c)}</span>
              <Badge variant="secondary">{t("aktiv")}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
