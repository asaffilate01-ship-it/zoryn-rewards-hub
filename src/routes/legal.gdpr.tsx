import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell, PageHeader, LegalNotice } from "@/components/PublicShell";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/legal/gdpr")({
  head: () => ({
    meta: [
      { title: "Deine DSGVO-Rechte — Zoryn" },
      {
        name: "description",
        content: "Übersicht deiner Rechte nach der Datenschutz-Grundverordnung.",
      },
      { property: "og:title", content: "DSGVO — Zoryn" },
      { property: "og:description", content: "Deine Rechte als betroffene Person nach DSGVO." },
      { property: "og:url", content: "/legal/gdpr" },
    ],
    links: [{ rel: "canonical", href: "/legal/gdpr" }],
  }),
  component: GdprPage,
});

function GdprPage() {
  const t = useT();
  return (
    <PublicShell>
      <PageHeader
        eyebrow={t("Rechtliches")}
        title="DSGVO / GDPR"
        description={t("Deine Rechte als betroffene Person.")}
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
        <LegalNotice />
        <div className="prose prose-invert max-w-none text-foreground [&_h3]:mt-6 [&_h3]:font-semibold [&_p]:text-muted-foreground">
          <h3>{t("Auskunft (Art. 15)")}</h3>
          <p>
            {t(
              "Erhalte eine Kopie aller personenbezogenen Daten, die wir über dich gespeichert haben.",
            )}
          </p>
          <h3>{t("Berichtigung (Art. 16)")}</h3>
          <p>{t("Falsche Daten werden auf deinen Wunsch korrigiert.")}</p>
          <h3>{t("Löschung (Art. 17)")}</h3>
          <p>{t("„Recht auf Vergessenwerden“ — mit Ausnahme gesetzlicher Aufbewahrungspflichten.“)}</p>
          <h3>{t("Einschränkung (Art. 18)")}</h3>
          <p>{t("Sperrung der Verarbeitung während einer Prüfung.")}</p>
          <h3>{t("Datenübertragbarkeit (Art. 20)")}</h3>
          <p>{t("Export deiner Daten in einem maschinenlesbaren Format.")}</p>
          <h3>{t("Widerspruch (Art. 21)")}</h3>
          <p>{t("Widerspruch gegen Verarbeitung auf Basis berechtigten Interesses.")}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("Antrag stellen? Nutze das")}{" "}
          <Link to="/legal/complaints" className="text-brand underline underline-offset-2">
            {t("Beschwerde- & Anfrageformular")}
          </Link>
          .
        </p>
      </section>
    </PublicShell>
  );
}
