import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Store, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMerchant, myMerchants } from "@/lib/merchant-portal.functions";
import { setActiveMerchantId } from "@/lib/active-merchant";

export const Route = createFileRoute("/_authenticated/merchant/")({
  component: MerchantHome,
});

const formSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "nur a-z, 0-9 und -"),
  description: z.string().max(500).optional(),
  category: z.string().max(40).optional(),
  pointsPerEuro: z.number().int().min(1).max(1000),
});

function MerchantHome() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(myMerchants);
  const createFn = useServerFn(createMerchant);
  const { data: list, isLoading } = useQuery({
    queryKey: ["myMerchants"],
    queryFn: () => listFn(),
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", category: "", pointsPerEuro: "10" });

  const create = useMutation({
    mutationFn: async () => {
      const parsed = formSchema.parse({
        ...form,
        pointsPerEuro: Number(form.pointsPerEuro),
      });
      return createFn({ data: parsed });
    },
    onSuccess: ({ merchantId }) => {
      toast.success("Merchant angelegt.");
      setActiveMerchantId(merchantId);
      qc.invalidateQueries({ queryKey: ["myMerchants"] });
      setShowForm(false);
      navigate({ to: "/merchant/pos" });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Business-Portal</h1>
          <p className="text-muted-foreground">Verwalte deine Zoryn-Merchants und vergib Punkte an Kundinnen.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-1 size-4" /> Merchant anlegen
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Neuer Merchant</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug (URL)"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} placeholder="cafe-nord" /></Field>
            <Field label="Kategorie"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Café, Retail…" /></Field>
            <Field label="Punkte pro Euro"><Input type="number" min={1} max={1000} value={form.pointsPerEuro} onChange={(e) => setForm({ ...form, pointsPerEuro: e.target.value })} /></Field>
            <div className="md:col-span-2">
              <Field label="Beschreibung"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></Field>
            </div>
            <div className="md:col-span-2">
              <Button disabled={create.isPending} onClick={() => create.mutate()}>
                {create.isPending ? "Speichere…" : "Anlegen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm uppercase tracking-wide text-muted-foreground">Deine Merchants</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Lade…</p>
        ) : !list || list.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Merchants. Lege oben deinen ersten an.
          </CardContent></Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {list.map(({ merchant, role }) => (
              <button
                key={merchant.id}
                onClick={() => { setActiveMerchantId(merchant.id); navigate({ to: "/merchant/pos" }); }}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md" style={{ background: merchant.brand_color ?? "#7c3aed" }}>
                    <Store className="size-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{merchant.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {role} · {merchant.points_per_euro} Pkt/€ {merchant.is_active ? "" : "· inaktiv"}
                    </div>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="flex items-center justify-between py-4 text-sm">
          <span className="text-muted-foreground">Zurück zur Consumer-App?</span>
          <Link to="/app" className="text-primary underline-offset-4 hover:underline">Zum Wallet</Link>
        </CardContent>
      </Card>
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
