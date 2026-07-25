import { createFileRoute } from "@tanstack/react-router";
import { PublicShell, PageHeader, LegalNotice } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { openConsent } from "@/lib/consent";

export const Route = createFileRoute("/legal/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie-Richtlinie — Zoryn" },
      { name: "description", content: "Welche Cookies Zoryn setzt und wie du sie kontrollierst." },
      { property: "og:title", content: "Cookie-Richtlinie — Zoryn" },
      { property: "og:description", content: "Cookies bei Zoryn — transparent und deiner Wahl." },
      { property: "og:url", content: "/legal/cookies" },
    ],
    links: [{ rel: "canonical", href: "/legal/cookies" }],
  }),
  component: () => (
    <PublicShell>
      <PageHeader eyebrow="Rechtliches" title="Cookie-Richtlinie" description="Transparenz über alle Cookie-Kategorien in Zoryn." />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
        <LegalNotice />
        <div className="prose prose-invert max-w-none text-foreground [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5">
          <h2>Notwendig</h2>
          <p>Diese Cookies sind für Anmeldung, Sicherheit und das Speichern deiner Cookie-Präferenz erforderlich. Sie lassen sich nicht deaktivieren.</p>
          <h2>Analyse</h2>
          <p>Optional. Wir messen anonymisiert, welche Bereiche der App genutzt werden, um Zoryn zu verbessern.</p>
          <h2>Marketing</h2>
          <p>Optional. Erlaubt uns, dir relevantere Angebote und Kampagnen zu zeigen.</p>
        </div>
        <div>
          <Button onClick={openConsent}>Cookie-Einstellungen öffnen</Button>
        </div>
      </section>
    </PublicShell>
  ),
});
