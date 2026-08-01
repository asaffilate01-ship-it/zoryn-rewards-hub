import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlatformShell, formatEuroCents } from "@/components/PlatformShell";
import { campaignStudio, createRewardCampaign, setCampaignStatus } from "@/lib/rewards-platform.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/campaign-studio")({
  component: CampaignStudioPage,
  head: () => ({
    meta: [
      { title: "Campaign Studio – Zoryn" },
      {
        name: "description",
        content: "Kampagnen mit Zielgruppe, Reward-Regel, Budget und Attribution in einem Studio bauen.",
      },
      { property: "og:title", content: "Campaign Studio – Zoryn" },
      {
        property: "og:description",
        content: "Kampagnen mit Zielgruppe, Reward-Regel, Budget und Attribution in einem Studio bauen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const TYPES = [
  { value: "multiplier", label: "Punkte-Multiplikator" },
  { value: "bonus", label: "Bonuspunkte" },
  { value: "cashback", label: "Cashback" },
  { value: "winback", label: "Win-back" },
] as const;

function CampaignStudioPage() {
  const t = useT();
  const qc = useQueryClient();
  const studioFn = useServerFn(campaignStudio);
  const createFn = useServerFn(createRewardCampaign);
  const statusFn = useServerFn(setCampaignStatus);

  const { data, isLoading, error } = useQuery({ queryKey: ["campaign-studio"], queryFn: () => studioFn() });

  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [campaignType, setCampaignType] = useState<(typeof TYPES)[number]["value"]>("multiplier");
  const [rewardValue, setRewardValue] = useState("2");
  const [budget, setBudget] = useState("500");
  const [segment, setSegment] = useState("");

  const activeTenant = tenantId || data?.tenants[0]?.id || "";

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          tenantId: activeTenant,
          merchantId: merchantId || undefined,
          name,
          campaignType,
          rewardValue: Number(rewardValue),
          budgetCents: Math.round(Number(budget) * 100),
          audienceSegment: segment || undefined,
        },
      }),
    onSuccess: () => {
      toast.success(t("Kampagne als Entwurf gespeichert"));
      setName("");
      setSegment("");
      qc.invalidateQueries({ queryKey: ["campaign-studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeStatus = useMutation({
    mutationFn: (input: { campaignId: string; status: "active" | "paused" }) => statusFn({ data: input }),
    onSuccess: () => {
      toast.success(t("Kampagnenstatus aktualisiert"));
      qc.invalidateQueries({ queryKey: ["campaign-studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PlatformShell
      eyebrow="Campaign Studio"
      title="Kampagnen bauen, budgetieren und messen."
      description="Zielgruppe, Auslöser, Reward-Regel und Budget – jede Kampagne wird gegen echte Attributionen gemessen."
    >
      {isLoading && <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("Neue Kampagne")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="campaign-name">{t("Name")}</Label>
                <Input
                  id="campaign-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("Ruhige Stunden 3×")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campaign-tenant">{t("Mandant")}</Label>
                <select
                  id="campaign-tenant"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={activeTenant}
                  onChange={(e) => {
                    setTenantId(e.target.value);
                    setMerchantId("");
                  }}
                >
                  {data.tenants.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campaign-merchant">{t("Händler (optional)")}</Label>
                <select
                  id="campaign-merchant"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                >
                  <option value="">{t("Alle Händler")}</option>
                  {data.merchants
                    .filter((m) => m.tenant_id === activeTenant)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campaign-type">{t("Typ")}</Label>
                <select
                  id="campaign-type"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value as typeof campaignType)}
                >
                  {TYPES.map((x) => (
                    <option key={x.value} value={x.value}>
                      {t(x.label)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campaign-value">{t("Reward-Wert")}</Label>
                <Input
                  id="campaign-value"
                  type="number"
                  min="0"
                  step="0.5"
                  value={rewardValue}
                  onChange={(e) => setRewardValue(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campaign-budget">{t("Budget (€)")}</Label>
                <Input
                  id="campaign-budget"
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campaign-segment">{t("Zielgruppe")}</Label>
                <Input
                  id="campaign-segment"
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  placeholder={t("Alle Mitglieder")}
                />
              </div>
              <div className="flex items-end">
                <Button
                  disabled={!name || !activeTenant || create.isPending}
                  onClick={() => create.mutate()}
                >
                  {t("Kampagne anlegen")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Kampagnen")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.campaigns.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("Noch keine Kampagnen.")}</p>
              )}
              {data.campaigns.map((c) => {
                const pct = c.budgetCents > 0 ? Math.min(100, (c.spendCents / c.budgetCents) * 100) : 0;
                return (
                  <div key={c.id} className="rounded-xl border border-border/60 bg-card/40 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{c.name}</p>
                      <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                      <Badge variant="outline">{c.campaign_type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {c.tenant_name}
                        {c.merchant_name ? ` · ${c.merchant_name}` : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.rewardSummary} · {c.audienceSummary}
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full gradient-brand" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>
                        {formatEuroCents(c.spendCents)} / {formatEuroCents(c.budgetCents)} {t("Budget")}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={changeStatus.isPending}
                          onClick={() =>
                            changeStatus.mutate({
                              campaignId: c.id,
                              status: c.status === "active" ? "paused" : "active",
                            })
                          }
                        >
                          {t(c.status === "active" ? "Pausieren" : "Aktivieren")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </PlatformShell>
  );
}
