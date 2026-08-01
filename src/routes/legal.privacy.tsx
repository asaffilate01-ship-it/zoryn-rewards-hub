import { createFileRoute } from "@tanstack/react-router";
import { PublicShell, PageHeader, LegalNotice } from "@/components/PublicShell";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Datenschutz — Zoryn" },
      { name: "description", content: "Datenschutzerklärung der Zoryn-Plattform gemäß DSGVO." },
      { property: "og:title", content: "Datenschutz — Zoryn" },
      { property: "og:description", content: "Wie Zoryn deine Daten schützt und verarbeitet." },
      { property: "og:url", content: "/legal/privacy" },
    ],
    links: [{ rel: "canonical", href: "/legal/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PublicShell>
      <PageHeader
        eyebrow="Rechtliches"
        title="Datenschutzerklärung"
        description="Wie wir personenbezogene Daten verarbeiten — gemäß DSGVO."
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
        <LegalNotice />
        <div className="prose prose-invert max-w-none text-foreground [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-brand">
          <h2>1. Verantwortliche Stelle</h2>
          <p>
            Zoryn (App-Betreiber). Kontakt: <a href="mailto:privacy@zoryn.app">privacy@zoryn.app</a>
            .
          </p>
          <h2>2. Erhobene Daten</h2>
          <ul>
            <li>Konto: E-Mail, Anzeigename, Mitgliedsnummer, optional Profilbild</li>
            <li>Transaktionen: Punktebuchungen mit Zeitpunkt, Partner, Beleg-ID</li>
            <li>Standort: Nur wenn du „In der Nähe" nutzt (temporär, nicht gespeichert)</li>
            <li>Geräte & Diagnose: nur mit deiner Einwilligung im Cookie-Banner</li>
          </ul>
          <h2>3. Zwecke</h2>
          <p>
            Bereitstellung der Wallet, Vergabe & Einlösung von Punkten, Betrugsprävention,
            gesetzliche Aufbewahrung.
          </p>
          <h2>4. Rechtsgrundlagen</h2>
          <p>
            Art. 6 Abs. 1 lit. b DSGVO (Vertrag), lit. c (rechtliche Verpflichtung), lit. f
            (berechtigtes Interesse), lit. a (Einwilligung, z. B. Marketing-Cookies).
          </p>
          <h2>5. Weitergabe</h2>
          <p>
            An Partner nur die notwendigen Buchungsdaten. Auftragsverarbeiter: unser Cloud-Provider
            (EU-Region).
          </p>
          <h2>6. Speicherdauer</h2>
          <p>
            Kontodaten bis Löschung. Transaktionen: 10 Jahre (Handelsrecht). Diagnose: max. 90 Tage.
          </p>
          <h2>7. Deine Rechte</h2>
          <p>
            Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch.
            Details siehe <a href="/legal/gdpr">DSGVO</a>. Beschwerde bei einer Aufsichtsbehörde
            möglich.
          </p>
          <h2>8. Cookies</h2>
          <p>
            Siehe <a href="/legal/cookies">Cookie-Richtlinie</a>. Einstellungen jederzeit im Footer
            änderbar.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
