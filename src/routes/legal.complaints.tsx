import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PublicShell, PageHeader, LegalNotice } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitComplaint } from "@/lib/complaints.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/legal/complaints")({
  head: () => ({
    meta: [
      { title: "Beschwerden & Anfragen — Zoryn" },
      {
        name: "description",
        content: "Reklamationen, Beschwerden und DSGVO-Anfragen sicher einreichen.",
      },
      { property: "og:title", content: "Beschwerden — Zoryn" },
      { property: "og:description", content: "Reklamationen und DSGVO-Anfragen einreichen." },
      { property: "og:url", content: "/legal/complaints" },
    ],
    links: [{ rel: "canonical", href: "/legal/complaints" }],
  }),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  const t = useT();
  const call = useServerFn(submitComplaint);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    membership_number: "",
    category: "complaint" as const,
    subject: "",
    message: "",
  });
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await call({ data: form });
      setDone(true);
      toast.success(t("Anfrage eingegangen — wir melden uns per E-Mail."));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("Konnte nicht gesendet werden"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PublicShell>
      <PageHeader
        eyebrow={t("Support")}
        title={t("Beschwerden & Anfragen")}
        description={t("Reklamationen, Datenschutz-Anfragen und Sicherheitsmeldungen.")}
      />
      <section className="mx-auto max-w-2xl space-y-6 px-4 py-14 sm:px-6">
        <LegalNotice />
        {done ? (
          <div className="rounded-3xl border border-success/40 bg-success/10 p-6 text-sm">
            {t("Danke — wir haben deine Anfrage erhalten und melden uns innerhalb von 5 Werktagen.")}
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-3xl border border-border/60 bg-card/50 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">{t("Name")}</Label>
                <Input
                  id="name"
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">{t("E-Mail")}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="mn">{t("Mitgliedsnummer (optional)")}</Label>
                <Input
                  id="mn"
                  maxLength={40}
                  value={form.membership_number}
                  onChange={(e) => setForm({ ...form, membership_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cat">{t("Kategorie")}</Label>
                <select
                  id="cat"
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as typeof form.category })
                  }
                >
                  <option value="complaint">{t("Beschwerde")}</option>
                  <option value="gdpr">{t("DSGVO-Anfrage")}</option>
                  <option value="billing">{t("Abrechnung")}</option>
                  <option value="security">{t("Sicherheit")}</option>
                  <option value="other">{t("Sonstiges")}</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="subj">{t("Betreff")}</Label>
              <Input
                id="subj"
                required
                maxLength={200}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="msg">{t("Nachricht")}</Label>
              <Textarea
                id="msg"
                required
                rows={6}
                maxLength={4000}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? t("Wird gesendet…") : t("Absenden")}
            </Button>
          </form>
        )}
      </section>
    </PublicShell>
  );
}
