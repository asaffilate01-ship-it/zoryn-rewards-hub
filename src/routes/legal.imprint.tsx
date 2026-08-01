import { createFileRoute } from "@tanstack/react-router";
import { PublicShell, PageHeader, LegalNotice } from "@/components/PublicShell";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/legal/imprint")({
  head: () => ({
    meta: [
      { title: "Impressum — Zoryn" },
      { name: "description", content: "Anbieterkennzeichnung gemäß § 5 TMG." },
      { property: "og:title", content: "Impressum — Zoryn" },
      { property: "og:description", content: "Impressum von Zoryn." },
      { property: "og:url", content: "/legal/imprint" },
    ],
    links: [{ rel: "canonical", href: "/legal/imprint" }],
  }),
  component: ImprintPage,
});

function ImprintPage() {
  const t = useT();
  return (
    <PublicShell>
      <PageHeader
        eyebrow={t("Rechtliches")}
        title={t("Impressum")}
        description={t("Angaben gemäß § 5 TMG.")}
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
        <LegalNotice />
        <div className="prose prose-invert max-w-none text-foreground [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:text-muted-foreground [&_a]:text-brand">
          <h2>{t("Anbieter")}</h2>
          <p>
            {t("Zoryn (App-Betreiber)")}
            <br />
            {t("Musterstraße 1")}
            <br />
            {t("10115 Berlin, Deutschland")}
          </p>
          <h2>{t("Kontakt")}</h2>
          <p>
            {t("E-Mail:")} <a href="mailto:hello@zoryn.app">hello@zoryn.app</a>
          </p>
          <h2>{t("Vertretungsberechtigt")}</h2>
          <p>{t("Geschäftsführung: (Name)")}</p>
          <h2>{t("Register")}</h2>
          <p>{t("Handelsregister: (Amtsgericht, HRB-Nr.) — USt-IdNr.: (DE...)")}</p>
          <h2>{t("Verantwortlich für den Inhalt")}</h2>
          <p>{t("(Name, Anschrift wie oben)")}</p>
          <h2>{t("EU-Streitschlichtung")}</h2>
          <p>
            {t("Plattform der EU-Kommission:")}{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
              ec.europa.eu/consumers/odr
            </a>
            . {t("Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren teilzunehmen.")}
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
