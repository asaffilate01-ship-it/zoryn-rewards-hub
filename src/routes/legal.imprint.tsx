import { createFileRoute } from "@tanstack/react-router";
import { PublicShell, PageHeader, LegalNotice } from "@/components/PublicShell";

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
  component: () => (
    <PublicShell>
      <PageHeader eyebrow="Rechtliches" title="Impressum" description="Angaben gemäß § 5 TMG." />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
        <LegalNotice />
        <div className="prose prose-invert max-w-none text-foreground [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:text-muted-foreground [&_a]:text-brand">
          <h2>Anbieter</h2>
          <p>Zoryn (App-Betreiber)<br />Musterstraße 1<br />10115 Berlin, Deutschland</p>
          <h2>Kontakt</h2>
          <p>E-Mail: <a href="mailto:hello@zoryn.app">hello@zoryn.app</a></p>
          <h2>Vertretungsberechtigt</h2>
          <p>Geschäftsführung: (Name)</p>
          <h2>Register</h2>
          <p>Handelsregister: (Amtsgericht, HRB-Nr.) — USt-IdNr.: (DE...)</p>
          <h2>Verantwortlich für den Inhalt</h2>
          <p>(Name, Anschrift wie oben)</p>
          <h2>EU-Streitschlichtung</h2>
          <p>Plattform der EU-Kommission: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren teilzunehmen.</p>
        </div>
      </section>
    </PublicShell>
  ),
});
