import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createOffer, deleteOffer, listMerchantOffers, toggleOffer } from "@/lib/offers.functions";
import { useActiveMerchantId } from "@/lib/active-merchant";

export const Route = createFileRoute("/_authenticated/merchant/offers")({
  component: OffersPage,
});

function OffersPage() {
  const merchantId = useActiveMerchantId();
  const qc = useQueryClient();
  const listFn = useServerFn(listMerchantOffers);
  const createFn = useServerFn(createOffer);
  const toggleFn = useServerFn(toggleOffer);
  const deleteFn = useServerFn(deleteOffer);

  const { data: offers, isLoading } = useQuery({
    queryKey: ["merchantOffers", merchantId],
    queryFn: () => listFn({ data: { merchantId: merchantId! } }),
    enabled: !!merchantId,
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    rewardMultiplier: "2",
    bonusPoints: "0",
    minSpendCents: "0",
    endsAt: "",
  });
  const [showForm, setShowForm] = useState(false);

  const create = useMutation({
    mutationFn: async () =>
      createFn({
        data: {
          merchantId: merchantId!,
          title: form.title,
          description: form.description || undefined,
          rewardMultiplier: Number(form.rewardMultiplier),
          bonusPoints: Number(form.bonusPoints),
          minSpendCents: Math.round(Number(form.minSpendCents) * 100),
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Angebot angelegt.");
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        rewardMultiplier: "2",
        bonusPoints: "0",
        minSpendCents: "0",
        endsAt: "",
      });
      qc.invalidateQueries({ queryKey: ["merchantOffers", merchantId] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  const toggle = useMutation({
    mutationFn: async (v: { offerId: string; isActive: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchantOffers", merchantId] }),
  });

  const remove = useMutation({
    mutationFn: async (offerId: string) => deleteFn({ data: { offerId } }),
    onSuccess: () => {
      toast.success("Angebot gelöscht.");
      qc.invalidateQueries({ queryKey: ["merchantOffers", merchantId] });
    },
  });

  if (!merchantId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-muted-foreground">Kein Merchant ausgewählt.</p>
          <Link to="/merchant">
            <Button>Merchant wählen</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Angebote</h1>
          <p className="text-sm text-muted-foreground">
            Boni und Multiplikatoren für deine Kundinnen.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-1 size-4" /> Neues Angebot
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neues Angebot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Titel">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Doppelte Punkte"
              />
            </Field>
            <Field label="Endet am (optional)">
              <Input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Beschreibung">
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Multiplikator (x)">
              <Input
                type="number"
                min={1}
                max={20}
                step="0.5"
                value={form.rewardMultiplier}
                onChange={(e) => setForm({ ...form, rewardMultiplier: e.target.value })}
              />
            </Field>
            <Field label="Bonuspunkte">
              <Input
                type="number"
                min={0}
                value={form.bonusPoints}
                onChange={(e) => setForm({ ...form, bonusPoints: e.target.value })}
              />
            </Field>
            <Field label="Mindestumsatz in €">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.minSpendCents}
                onChange={(e) => setForm({ ...form, minSpendCents: e.target.value })}
              />
            </Field>
            <div className="md:col-span-2">
              <Button
                disabled={create.isPending || form.title.length < 3}
                onClick={() => create.mutate()}
              >
                {create.isPending ? "Speichere…" : "Anlegen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Lade…</p>
      ) : !offers || offers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Angebote.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {offers.map((o) => (
            <Card key={o.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <div className="font-medium">{o.title}</div>
                    {o.description && (
                      <div className="text-sm text-muted-foreground">{o.description}</div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {Number(o.reward_multiplier) > 1 && `${o.reward_multiplier}× · `}
                      {o.bonus_points > 0 && `+${o.bonus_points} Pkt · `}
                      Min. €{(o.min_spend_cents / 100).toFixed(2)}
                      {o.ends_at && ` · bis ${new Date(o.ends_at).toLocaleDateString("de-DE")}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={o.is_active}
                    onCheckedChange={(v) => toggle.mutate({ offerId: o.id, isActive: v })}
                  />
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(o.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
