import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Gift, Plus, Trash2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createReward, deleteReward, listMerchantRewards, toggleReward, useRewardCode,
} from "@/lib/rewards.functions";
import { useActiveMerchantId } from "@/lib/active-merchant";

export const Route = createFileRoute("/_authenticated/merchant/rewards")({
  component: MerchantRewards,
});

function MerchantRewards() {
  const merchantId = useActiveMerchantId();
  const qc = useQueryClient();
  const listFn = useServerFn(listMerchantRewards);
  const createFn = useServerFn(createReward);
  const toggleFn = useServerFn(toggleReward);
  const delFn = useServerFn(deleteReward);
  const useCodeFn = useServerFn(useRewardCode);

  const { data: list, isLoading } = useQuery({
    queryKey: ["merchantRewards", merchantId],
    queryFn: () => listFn({ data: { merchantId: merchantId! } }),
    enabled: !!merchantId,
  });

  const [form, setForm] = useState({ title: "", description: "", costPoints: "500", stock: "" });
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");

  const create = useMutation({
    mutationFn: async () => createFn({ data: {
      merchantId: merchantId!,
      title: form.title,
      description: form.description || undefined,
      costPoints: Number(form.costPoints),
      stock: form.stock ? Number(form.stock) : undefined,
    }}),
    onSuccess: () => {
      toast.success("Belohnung angelegt.");
      setForm({ title: "", description: "", costPoints: "500", stock: "" });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["merchantRewards", merchantId] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  const toggle = useMutation({
    mutationFn: async (v: { rewardId: string; active: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchantRewards", merchantId] }),
  });
  const del = useMutation({
    mutationFn: async (rewardId: string) => delFn({ data: { rewardId } }),
    onSuccess: () => {
      toast.success("Gelöscht.");
      qc.invalidateQueries({ queryKey: ["merchantRewards", merchantId] });
    },
  });

  const redeemCode = useMutation({
    mutationFn: async () => useCodeFn({ data: { merchantId: merchantId!, code } }),
    onSuccess: (r) => { toast.success(`Eingelöst: ${r.reward_title}`); setCode(""); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  if (!merchantId) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm text-muted-foreground">Bitte einen Merchant auswählen.</p>
        <Link to="/merchant" className="text-sm text-primary underline">Zur Übersicht</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Belohnungen</h1>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="mr-1 size-4" /> Neue Belohnung
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Code einlösen</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Belohnungscode" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <Button onClick={() => redeemCode.mutate()} disabled={!code || redeemCode.isPending}>
            <Ticket className="mr-1 size-4" /> Einlösen
          </Button>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Belohnung anlegen</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Titel</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Gratis Kaffee" />
            </div>
            <div className="grid gap-1.5">
              <Label>Beschreibung</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Kosten (Punkte)</Label>
                <Input type="number" value={form.costPoints} onChange={(e) => setForm({ ...form, costPoints: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Bestand (leer = unbegrenzt)</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Abbrechen</Button>
              <Button onClick={() => create.mutate()} disabled={!form.title || create.isPending}>Anlegen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Laden…</p>}
      <div className="grid gap-3">
        {(list ?? []).map((r) => (
          <Card key={r.id}>
            <CardContent className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary"><Gift className="size-5" /></div>
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.cost_points.toLocaleString("de-DE")} Punkte
                    {r.stock !== null && ` · Bestand ${r.stock}`}
                  </div>
                  {r.description && <div className="mt-1 text-sm text-muted-foreground">{r.description}</div>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Aktiv
                  <Switch checked={r.active} onCheckedChange={(v) => toggle.mutate({ rewardId: r.id, active: v })} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => del.mutate(r.id)}><Trash2 className="size-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {list && list.length === 0 && (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Noch keine Belohnungen.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
