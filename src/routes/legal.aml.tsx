import { createFileRoute } from "@tanstack/react-router";
import { PublicShell, PageHeader, LegalNotice } from "@/components/PublicShell";

export const Route = createFileRoute("/legal/aml")({
  head: () => ({
    meta: [
      { title: "AML / KYC — Zoryn" },
      {
        name: "description",
        content: "Kurzhinweise zu Geldwäscheprävention und Identitätsprüfung.",
      },
      { property: "og:title", content: "AML / KYC — Zoryn" },
      { property: "og:description", content: "Wie Zoryn Geldwäscheprävention handhabt." },
      { property: "og:url", content: "/legal/aml" },
    ],
    links: [{ rel: "canonical", href: "/legal/aml" }],
  }),
  component: () => (
    <PublicShell>
      <PageHeader
        eyebrow="Rechtliches"
        title="AML & KYC"
        description="Kurzüberblick zur Geldwäscheprävention."
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
        <LegalNotice />
        <div className="prose prose-invert max-w-none text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5">
          <p>
            Zoryn-Punkte sind eine limitierte Loyalitätswährung ohne Bargeld-Rückerstattung und
            stellen kein E-Geld dar. Wir setzen dennoch angemessene Kontrollen zur Missbrauchs- und
            Geldwäscheprävention ein:
          </p>
          <ul>
            <li>Limits pro Buchung, pro Konto und pro Zeitraum</li>
            <li>Doppeltes Ledger mit Audit-Trail</li>
            <li>Automatische Anomalie-Erkennung</li>
            <li>Bei Verdachtsfällen: Sperrung und Rückfrage</li>
          </ul>
        </div>
      </section>
    </PublicShell>
  ),
});
