import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { fileClaim, listMyClaims } from "@/lib/claims.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/claim")({
  head: () => ({ meta: [{ title: "Punkte reklamieren — Zoryn" }] }),
  component: ClaimPage,
});

function ClaimPage() {
  const qc = useQueryClient();
  const fileFn = useServerFn(fileClaim);
  const listFn = useServerFn(listMyClaims);
  const { data: claims } = useQuery({ queryKey: ["myClaims"], queryFn: () => listFn() });

  const [form, setForm] = useState({
    merchantName: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    amountEuros: "",
    reference: "",
    notes: "",
  });

  const submit = useMutation({
    mutationFn: async () => fileFn({
      data: {
        merchantName: form.merchantName,
        purchaseDate: form.purchaseDate,
        amountEuros: Number(form.amountEuros),
        reference: form.reference || undefined,
        notes: form.notes || undefined,
      },
    }),
    onSuccess: () => {
      toast.success("Reklamation eingereicht.");
      setForm({ merchantName: "", purchaseDate: new Date().toISOString().slice(0, 10), amountEuros: "", reference: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["myClaims"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  return (
    <>
      <Link to="/app/profile" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Profil
      </Link>
      <h1 className="text-2xl font-semibold">Punkte reklamieren</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Kein Scan erhalten? Reiche deinen Beleg ein — wir prüfen und schreiben nachträglich gut.
      </p>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Neue Reklamation</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Händler">
            <Input value={form.merchantName} onChange={(e) => setForm({ ...form, merchantName: e.target.value })} placeholder="z. B. Café Nord" />
          </Field>
          <Field label="Datum">
            <Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
          </Field>
          <Field label="Betrag (€)">
            <Input type="number" step="0.01" value={form.amountEuros} onChange={(e) => setForm({ ...form, amountEuros: e.target.value })} />
          </Field>
          <Field label="Belegnummer (optional)">
            <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notiz (optional)">
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Button disabled={submit.isPending || !form.merchantName || !form.amountEuros} onClick={() => submit.mutate()}>
              {submit.isPending ? "Sende…" : "Einreichen"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Deine Reklamationen</h2>
      <div className="grid gap-2">
        {(claims ?? []).map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">{c.merchant_name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(c.purchase_date).toLocaleDateString("de-DE")} · €{(c.amount_cents / 100).toFixed(2)}
                </div>
              </div>
              <span className={`text-xs ${
                c.status === "open" ? "text-amber-500" :
                c.status === "approved" ? "text-emerald-500" : "text-muted-foreground"
              }`}>{c.status}</span>
            </CardContent>
          </Card>
        ))}
        {claims && claims.length === 0 && (
          <p className="text-sm text-muted-foreground">Noch keine Reklamationen.</p>
        )}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
