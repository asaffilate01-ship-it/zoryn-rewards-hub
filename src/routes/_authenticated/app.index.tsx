import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { QrCode, ShoppingBag, ArrowDownRight, ArrowUpRight, Sparkles, Gift } from "lucide-react";
import { walletQueryOptions, merchantsQueryOptions } from "@/lib/wallet.queries";
import { earnPoints, redeemPoints } from "@/lib/wallet.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Wallet — Zoryn" },
      { name: "description", content: "Deine Zoryn-Wallet, Punkte und Aktivitäten." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(walletQueryOptions());
    context.queryClient.ensureQueryData(merchantsQueryOptions());
  },
  component: WalletHome,
});

function WalletHome() {
  const qc = useQueryClient();
  const { data: wallet } = useSuspenseQuery(walletQueryOptions());
  const { data: merchants } = useSuspenseQuery(merchantsQueryOptions());
  const [firstName, setFirstName] = useState<string | null>(null);
  const [membership, setMembership] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, membership_number")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (profile) {
        setFirstName(profile.first_name);
        setMembership(profile.membership_number);
      }
    })();
  }, []);

  const earnFn = useServerFn(earnPoints);
  const redeemFn = useServerFn(redeemPoints);

  const earnMutation = useMutation({
    mutationFn: earnFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Punkte gutgeschrieben");
    },
    onError: (e) => toast.error(e.message),
  });

  const redeemMutation = useMutation({
    mutationFn: redeemFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Einlösung erfolgreich");
    },
    onError: (e) => toast.error(e.message),
  });

  function demoEarn() {
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    if (!merchant) return;
    const amount = 100 + Math.floor(Math.random() * 400);
    earnMutation.mutate({
      data: {
        merchantId: merchant.id,
        amount,
        idempotencyKey: crypto.randomUUID(),
        memo: `Demo-Einkauf bei ${merchant.name}`,
      },
    });
  }

  function demoRedeem() {
    redeemMutation.mutate({
      data: {
        amount: 200,
        idempotencyKey: crypto.randomUUID(),
        memo: "Einlösung 2,00 €",
      },
    });
  }

  const tier = tierFor(wallet.balance_points);

  return (
    <>
      <div className="text-sm text-muted-foreground">
        Guten Tag{firstName ? `, ${firstName}` : ""}
      </div>

      <div className="surface-glass glow-brand mt-4 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Universelle Wallet
          </div>
          <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-brand-soft">
            {tier}
          </span>
        </div>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-display text-5xl font-semibold tabular-nums">
            {wallet.balance_points.toLocaleString("de-DE")}
          </span>
          <span className="text-sm text-muted-foreground">Punkte</span>
        </div>
        <div className="text-sm text-brand-soft">
          ≈ {wallet.euro_equivalent.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Mitglieds-Nr. {membership ?? "—"}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Action icon={QrCode} label="Scannen" onClick={() => toast("QR-Scanner kommt in Phase 3.")} />
          <Action
            icon={Sparkles}
            label={earnMutation.isPending ? "…" : "Demo Earn"}
            onClick={demoEarn}
            disabled={earnMutation.isPending || merchants.length === 0}
          />
          <Action
            icon={Gift}
            label={redeemMutation.isPending ? "…" : "Einlösen"}
            onClick={demoRedeem}
            disabled={redeemMutation.isPending || wallet.balance_points < 200}
          />
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Aktivität</h2>
          <span className="text-xs text-muted-foreground">Letzte 20</span>
        </div>
        {wallet.transactions.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Noch keine Aktivität. Tippe „Demo Earn", um eine Buchung zu sehen.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card/60">
            {wallet.transactions.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="flex size-9 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    background: t.merchant?.brand_color
                      ? `${t.merchant.brand_color}22`
                      : "hsl(var(--secondary))",
                    color: t.merchant?.brand_color ?? "hsl(var(--foreground))",
                  }}
                >
                  {t.merchant?.name?.[0] ?? (t.signed_points > 0 ? "+" : "−")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {t.merchant?.name ?? kindLabel(t.kind)}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {t.memo ?? kindLabel(t.kind)} · {formatDate(t.created_at)}
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold tabular-nums ${
                    t.signed_points >= 0 ? "text-brand-soft" : "text-foreground"
                  }`}
                >
                  {t.signed_points >= 0 ? (
                    <ArrowUpRight className="size-4" />
                  ) : (
                    <ArrowDownRight className="size-4" />
                  )}
                  {t.signed_points > 0 ? "+" : ""}
                  {t.signed_points.toLocaleString("de-DE")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Partner</h2>
          <Link to="/app/shop" className="text-xs text-brand-soft hover:underline">
            Alle ansehen
          </Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {merchants.slice(0, 4).map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-card/60 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 items-center justify-center rounded-xl text-sm font-semibold"
                  style={{
                    background: `${m.brand_color ?? "#6366F1"}22`,
                    color: m.brand_color ?? "#6366F1",
                  }}
                >
                  {m.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.points_per_euro} Punkte / €
                  </div>
                </div>
              </div>
              {m.description && (
                <p className="mt-2 text-xs text-muted-foreground">{m.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Action({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl bg-secondary/60 px-3 py-3 text-center text-xs transition hover:bg-secondary disabled:opacity-40"
    >
      <Icon className="mx-auto mb-1 size-5 text-brand-soft" />
      {label}
    </button>
  );
}

function tierFor(points: number) {
  if (points >= 50_000) return "Platinum";
  if (points >= 20_000) return "Gold";
  if (points >= 5_000) return "Silver";
  return "Bronze";
}

function kindLabel(kind: string) {
  switch (kind) {
    case "earn":
      return "Punkte gesammelt";
    case "redeem":
      return "Punkte eingelöst";
    case "adjust":
      return "Anpassung";
    case "transfer":
      return "Übertrag";
    case "expire":
      return "Abgelaufen";
    default:
      return kind;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
