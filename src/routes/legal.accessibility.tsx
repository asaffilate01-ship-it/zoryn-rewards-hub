import { createFileRoute } from "@tanstack/react-router";
import { PublicShell, PageHeader, LegalNotice } from "@/components/PublicShell";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/legal/accessibility")({
  head: () => ({
    meta: [
      { title: "Barrierefreiheit — Zoryn" },
      { name: "description", content: "Erklärung zur Barrierefreiheit der Zoryn-Plattform." },
      { property: "og:title", content: "Barrierefreiheit — Zoryn" },
      {
        property: "og:description",
        content: "So arbeiten wir an einer barrierefreien Zoryn-Erfahrung.",
      },
      { property: "og:url", content: "/legal/accessibility" },
    ],
    links: [{ rel: "canonical", href: "/legal/accessibility" }],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const t = useT();
  return (
    <PublicShell>
      <PageHeader
        eyebrow={t("Rechtliches")}
        title={t("Erklärung zur Barrierefreiheit")}
        description={t("Unser laufendes Bekenntnis zu WCAG 2.2 AA.")}
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
        <LegalNotice />
        <p className="text-muted-foreground">
          {t(
            "Zoryn strebt Konformität mit WCAG 2.2 AA an. Wir testen mit Tastatur, Screenreader und reduzierter Bewegung. Hinweise gerne an",
          )}{" "}
          <a href="mailto:a11y@zoryn.app" className="text-brand underline underline-offset-2">
            a11y@zoryn.app
          </a>
          .
        </p>
      </section>
    </PublicShell>
  );
}
