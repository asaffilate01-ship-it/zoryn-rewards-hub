import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEuroCents, formatNumber } from "@/components/PlatformShell";
import type { RewardsV4Overview } from "@/lib/rewards-v4.functions";
import { useT } from "@/lib/i18n";

const GOALS = [
  { value: "winback", label: "Kunden zurückgewinnen" },
  { value: "multiplier", label: "Frequenz steigern" },
  { value: "cashback", label: "Warenkorb erhöhen" },
  { value: "bonus", label: "Neukunden aktivieren" },
] as const;

const STEPS = ["Ziel", "Reward", "Budget", "Vorschau"] as const;

export function CampaignStudioV4({ data }: { data: RewardsV4Overview }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<(typeof GOALS)[number]["value"]>("winback");
  const [multiplier, setMultiplier] = useState("2");
  const [budget, setBudget] = useState("500");
  const [segmentId, setSegmentId] = useState("");

  const segment = data.segments.find((s) => s.id === segmentId) ?? data.segments[0];
  const reach = segment?.members ?? 0;
  const budgetCents = Math.round(Number(budget || 0) * 100);
  const estimate = useMemo(() => {
    const costPerMember = Math.max(50, Number(multiplier || 1) * 75);
    const reachable =
      costPerMember > 0 ? Math.min(reach, Math.floor(budgetCents / costPerMember)) : 0;
    return { reachable, costPerMember };
  }, [multiplier, budgetCents, reach]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{t("Kampagnen-Assistent")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(i)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  i === step
                    ? "gradient-brand text-primary-foreground"
                    : "border border-border/60 bg-card/50 text-muted-foreground"
                }`}
              >
                {i + 1}. {t(s)}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              {step === 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGoal(g.value)}
                      className={`rounded-xl border p-3 text-left text-sm transition ${
                        goal === g.value
                          ? "border-primary bg-primary/10"
                          : "border-border/60 bg-card/40 hover:border-border"
                      }`}
                    >
                      {t(g.label)}
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="v4-multiplier">{t("Reward-Multiplikator")}</Label>
                    <Input
                      id="v4-multiplier"
                      type="number"
                      min="1"
                      step="0.5"
                      value={multiplier}
                      onChange={(e) => setMultiplier(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="v4-segment">{t("Zielgruppe")}</Label>
                    <select
                      id="v4-segment"
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={segment?.id ?? ""}
                      onChange={(e) => setSegmentId(e.target.value)}
                    >
                      {data.segments.length === 0 && (
                        <option value="">{t("Alle Mitglieder")}</option>
                      )}
                      {data.segments.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-1.5 sm:max-w-xs">
                  <Label htmlFor="v4-budget">{t("Budget (€)")}</Label>
                  <Input
                    id="v4-budget"
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("Geschätzte Kosten pro Kunde")}: {formatEuroCents(estimate.costPerMember)}
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm">
                  <p className="font-medium">{t("Zusammenfassung")}</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>
                      {t("Ziel")}: {t(GOALS.find((g) => g.value === goal)?.label ?? "")}
                    </li>
                    <li>
                      {t("Reward")}: {multiplier}×
                    </li>
                    <li>
                      {t("Budget")}: {formatEuroCents(budgetCents)}
                    </li>
                    <li>
                      {t("Zielgruppe")}: {segment?.name ?? t("Alle Mitglieder")}
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={step === 0}
                  onClick={() => setStep((s) => s - 1)}
                >
                  {t("Zurück")}
                </Button>
                <Button
                  size="sm"
                  disabled={step === STEPS.length - 1}
                  onClick={() => setStep((s) => s + 1)}
                >
                  {t("Weiter")}
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {t("Kundenvorschau")}
              </p>
              <div className="mt-3 rounded-xl border border-border/60 bg-background/60 p-4">
                <p className="font-display text-lg font-semibold">
                  {multiplier}× {t("Punkte")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("Nur für dich – sammle diese Woche mehr bei deinem Lieblingshändler.")}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">{t("Segmentgröße")}</p>
                  <p className="font-semibold">{formatNumber(reach)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("Erreichbar")}</p>
                  <p className="font-semibold">{formatNumber(estimate.reachable)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("Kampagnen-ROI")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.campaigns.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("Noch keine Kampagnen.")}</p>
            )}
            {data.campaigns.map((c) => (
              <div key={c.id} className="rounded-xl border border-border/50 bg-card/40 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{c.name}</p>
                  <Badge variant={c.status === "active" ? "default" : "secondary"}>
                    {c.status}
                  </Badge>
                  <Badge variant="outline">{c.goal}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatEuroCents(c.spentCents)} / {formatEuroCents(c.budgetCents)} {t("Budget")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Automatisierungen")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.automations.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("Keine Automatisierungen.")}</p>
            )}
            {data.automations.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card/40 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {a.triggerType.replace(/_/g, " ")}
                  </p>
                </div>
                <Badge variant={a.status === "active" ? "default" : "secondary"}>{a.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
