import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformShell } from "@/components/PlatformShell";
import {
  ONBOARDING_STEPS,
  onboardingBoard,
  setOnboardingStep,
} from "@/lib/rewards-platform.functions";
import type { OnboardingStep } from "@/lib/rewards-platform.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/merchant-onboarding")({
  component: MerchantOnboardingPage,
  head: () => ({
    meta: [
      { title: "Händler-Onboarding – Zoryn" },
      {
        name: "description",
        content: "Neun geführte Schritte vom Geschäftsprofil bis zum Launch des Loyalty-Programms.",
      },
      { property: "og:title", content: "Händler-Onboarding – Zoryn" },
      {
        property: "og:description",
        content: "Neun geführte Schritte vom Geschäftsprofil bis zum Launch des Loyalty-Programms.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const STEP_LABEL: Record<OnboardingStep, string> = {
  business_profile: "Geschäftsprofil",
  programme_type: "Programmtyp",
  locations: "Standorte",
  reward_rules: "Reward-Regeln",
  branding: "Branding",
  funding: "Finanzierung",
  staff: "Team",
  test_transaction: "Testtransaktion",
  review_launch: "Prüfen und starten",
};

function MerchantOnboardingPage() {
  const t = useT();
  const qc = useQueryClient();
  const boardFn = useServerFn(onboardingBoard);
  const stepFn = useServerFn(setOnboardingStep);
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["onboarding-board"],
    queryFn: () => boardFn(),
  });

  const merchant = useMemo(() => {
    if (!data) return null;
    return data.merchants.find((m) => m.id === selected) ?? data.merchants[0] ?? null;
  }, [data, selected]);

  const update = useMutation({
    mutationFn: (input: { step: OnboardingStep; status: "in_progress" | "complete" }) =>
      stepFn({
        data: {
          tenantId: merchant!.tenant_id,
          merchantId: merchant!.id,
          step: input.step,
          status: input.status,
        },
      }),
    onSuccess: () => {
      toast.success(t("Onboarding aktualisiert"));
      qc.invalidateQueries({ queryKey: ["onboarding-board"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusFor = (step: OnboardingStep) =>
    data?.progress.find((p) => p.merchant_id === merchant?.id && p.step === step)?.status ??
    "not_started";

  const completed = ONBOARDING_STEPS.filter((s) => statusFor(s) === "complete").length;

  return (
    <PlatformShell
      eyebrow="Händler-Onboarding"
      title="Ein Loyalty-Programm starten – ganz ohne Banking."
      description="Derselbe Mandant kann später Zoryn Money, ZorynPay, POS-, Affiliate- und Card-Linked-Kanäle verbinden."
    >
      {isLoading && <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {data && data.merchants.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t("Noch keine Händler in diesem Mandanten.")}
        </p>
      )}

      {data && data.merchants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.merchants.map((m) => (
            <Button
              key={m.id}
              size="sm"
              variant={m.id === merchant?.id ? "default" : "outline"}
              onClick={() => setSelected(m.id)}
            >
              {m.name}
            </Button>
          ))}
        </div>
      )}

      {merchant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5">
              <Store className="size-5 text-primary" />
              <span>{merchant.name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {completed}/{ONBOARDING_STEPS.length} {t("Schritte abgeschlossen")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full gradient-brand transition-all"
                style={{ width: `${(completed / ONBOARDING_STEPS.length) * 100}%` }}
              />
            </div>
            {ONBOARDING_STEPS.map((step) => {
              const status = statusFor(step);
              const done = status === "complete";
              return (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
                >
                  {done ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{t(STEP_LABEL[step])}</p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        done
                          ? "Abgeschlossen"
                          : status === "in_progress"
                            ? "In Arbeit"
                            : "Nicht gestartet",
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={done ? "outline" : "default"}
                    disabled={update.isPending}
                    onClick={() =>
                      update.mutate({ step, status: done ? "in_progress" : "complete" })
                    }
                  >
                    {update.isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                    {t(done ? "Wieder öffnen" : "Abschließen")}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </PlatformShell>
  );
}
