import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Megaphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createCampaign,
  deleteCampaign,
  listMerchantCampaigns,
  toggleCampaign,
} from "@/lib/campaigns.functions";
import { useActiveMerchantId } from "@/lib/active-merchant";

export const Route = createFileRoute("/_authenticated/merchant/campaigns")({
  component: CampaignsPage,
});

function CampaignsPage() {
  const merchantId = useActiveMerchantId();
  const qc = useQueryClient();
  const listFn = useServerFn(listMerchantCampaigns);
  const createFn = useServerFn(createCampaign);
  const toggleFn = useServerFn(toggleCampaign);
  const deleteFn = useServerFn(deleteCampaign);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["merchantCampaigns", merchantId],
    queryFn: () => listFn({ data: { merchantId: merchantId! } }),
    enabled: !!merchantId,
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    multiplier: "2",
    startsAt: "",
    endsAt: "",
  });

  const create = useMutation({
    mutationFn: async () =>
      createFn({
        data: {
          merchantId: merchantId!,
          name: form.name,
          description: form.description || undefined,
          multiplier: Number(form.multiplier),
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Kampagne angelegt.");
      setShowForm(false);
      setForm({ name: "", description: "", multiplier: "2", startsAt: "", endsAt: "" });
      qc.invalidateQueries({ queryKey: ["merchantCampaigns", merchantId] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  const toggle = useMutation({
    mutationFn: async (v: { campaignId: string; active: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchantCampaigns", merchantId] }),
  });

  const remove = useMutation({
    mutationFn: async (campaignId: string) => deleteFn({ data: { campaignId } }),
    onSuccess: () => {
      toast.success("Kampagne gelöscht.");
      qc.invalidateQueries({ queryKey: ["merchantCampaigns", merchantId] });
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
          <h1 className="font-display text-2xl font-semibold">Kampagnen</h1>
          <p className="text-sm text-muted-foreground">
            Zeitgesteuerte Punkte-Multiplikatoren für Aktionen.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-1 size-4" /> Neue Kampagne
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neue Kampagne</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Sommer-Special"
              />
            </Field>
            <Field label="Multiplikator (x)">
              <Input
                type="number"
                min={1}
                max={10}
                step="0.5"
                value={form.multiplier}
                onChange={(e) => setForm({ ...form, multiplier: e.target.value })}
              />
            </Field>
            <Field label="Startet am (optional)">
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
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
            <div className="md:col-span-2">
              <Button
                disabled={create.isPending || form.name.length < 3}
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
      ) : !rows || rows.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Kampagnen.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Megaphone className="size-4" />
                  </div>
                  <div>
                    <div className="font-medium">{c.name}</div>
                    {c.description && (
                      <div className="text-sm text-muted-foreground">{c.description}</div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {c.multiplier}× ·{" "}
                      {new Date(c.starts_at).toLocaleDateString("de-DE")}
                      {c.ends_at && ` – ${new Date(c.ends_at).toLocaleDateString("de-DE")}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={c.active}
                    onCheckedChange={(v) => toggle.mutate({ campaignId: c.id, active: v })}
                  />
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(c.id)}>
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
