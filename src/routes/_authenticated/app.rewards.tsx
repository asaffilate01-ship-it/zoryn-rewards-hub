import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Gift, Sparkles, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listActiveRewards, listMyRedemptions, redeemReward } from "@/lib/rewards.functions";
import { getWallet } from "@/lib/wallet.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/app/rewards")({
  head: () => ({
    meta: [
      { title: "Belohnungen — Zoryn" },
      {
        name: "description",
        content: "Löse deine Zoryn-Punkte gegen Belohnungen aus Berliner Lieblingsläden ein.",
      },
    ],
  }),
  component: RewardsPage,
});

function RewardsPage() {
  const t = useT();
  const qc = useQueryClient();
  const listFn = useServerFn(listActiveRewards);
  const walletFn = useServerFn(getWallet);
  const myFn = useServerFn(listMyRedemptions);
  const redeemFn = useServerFn(redeemReward);

  const { data: rewards, isLoading } = useQuery({ queryKey: ["rewards"], queryFn: () => listFn() });
  const { data: wallet } = useQuery({ queryKey: ["wallet"], queryFn: () => walletFn() });
  const { data: mine } = useQuery({ queryKey: ["myRedemptions"], queryFn: () => myFn() });

  const balance = wallet?.balance_points ?? 0;

  const redeem = useMutation({
    mutationFn: async (rewardId: string) =>
      redeemFn({ data: { rewardId, idempotencyKey: crypto.randomUUID() } }),
    onSuccess: (r) => {
      toast.success(`${t("Belohnung eingelöst — Code")} ${r.code}`);
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["myRedemptions"] });
      qc.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : t("Fehler")),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{t("Belohnungen")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("Verfügbar:")}{" "}
          <span className="font-medium text-foreground">
            {balance.toLocaleString("de-DE")} {t("Punkte")}
          </span>{" "}
          (~€{(balance / 100).toFixed(2)})
        </p>
      </div>

      {mine && mine.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">{t("Deine Codes")}</h2>
          <div className="grid gap-2">
            {mine
              .filter((r) => r.status === "pending")
              .slice(0, 3)
              .map((r) => (
                <Card key={r.id} className="border-primary/40">
                  <CardContent className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <div className="text-sm font-medium">{r.reward_title}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.merchant?.name} · {t("zeige den Code im Geschäft")}
                      </div>
                    </div>
                    <div className="rounded-md bg-primary/10 px-3 py-1.5 font-mono text-lg font-semibold tracking-wider text-primary">
                      {r.code}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">{t("Verfügbare Belohnungen")}</h2>
        {isLoading && <p className="text-sm text-muted-foreground">{t("Laden…")}</p>}
        <div className="grid gap-3">
          {(rewards ?? []).map((r) => {
            const affordable = balance >= r.cost_points;
            const soldOut = r.stock !== null && r.stock <= 0;
            return (
              <Card key={r.id}>
                <CardContent className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                      <Gift className="size-5" />
                    </div>
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.merchant?.name}
                        {r.merchant?.category ? ` · ${r.merchant.category}` : ""}
                      </div>
                      {r.description && (
                        <div className="mt-1 text-sm text-muted-foreground">{r.description}</div>
                      )}
                      {r.stock !== null && !soldOut && (
                        <div className="mt-1 text-xs text-amber-500">
                          {t("Nur noch")} {r.stock} {t("verfügbar")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="inline-flex items-center gap-1 text-sm font-semibold">
                      <Sparkles className="size-4 text-primary" />
                      {r.cost_points.toLocaleString("de-DE")}
                    </div>
                    <Button
                      size="sm"
                      disabled={!affordable || soldOut || redeem.isPending}
                      onClick={() => redeem.mutate(r.id)}
                    >
                      <Ticket className="mr-1 size-4" />
                      {soldOut
                        ? t("Ausverkauft")
                        : affordable
                          ? t("Einlösen")
                          : t("Zu wenig Punkte")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {rewards && rewards.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t("Noch keine Belohnungen verfügbar.")}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
