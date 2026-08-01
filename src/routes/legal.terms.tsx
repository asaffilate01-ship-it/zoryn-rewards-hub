import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PublicShell, PageHeader, LegalNotice } from "@/components/PublicShell";

function LegalLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <PublicShell>
      <PageHeader eyebrow="Rechtliches" title={title} description={description} />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <LegalNotice />
        <div className="prose prose-invert mt-8 max-w-none text-foreground [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:font-semibold [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul>li]:my-1 [&_a]:text-brand">
          {children}
        </div>
      </section>
    </PublicShell>
  );
}

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "AGB — Zoryn" },
      {
        name: "description",
        content: "Allgemeine Geschäftsbedingungen der Zoryn-Plattform für Kund:innen und Partner.",
      },
      { property: "og:title", content: "AGB — Zoryn" },
      { property: "og:description", content: "Nutzungsbedingungen von Zoryn." },
      { property: "og:url", content: "/legal/terms" },
    ],
    links: [{ rel: "canonical", href: "/legal/terms" }],
  }),
  component: () => (
    <LegalLayout
      title="Allgemeine Geschäftsbedingungen"
      description="Die Nutzungsbedingungen der Zoryn-Plattform."
    >
      <h2>1. Geltungsbereich</h2>
      <p>
        Diese AGB gelten für die Nutzung der Zoryn-Loyalty-Plattform (Web, PWA, Native-Apps) durch
        Verbraucher:innen sowie für Händler und deren Personal.
      </p>
      <h2>2. Zoryn-Wallet und Punkte</h2>
      <ul>
        <li>100 Punkte entsprechen 1 € Gegenwert im Zoryn-Netzwerk.</li>
        <li>
          Punkte sind personengebunden, nicht übertragbar und werden über ein doppeltes
          Ledger-System verwaltet.
        </li>
        <li>
          Punkte, die bei einem Partner gesammelt wurden, verfallen — sofern nicht anders angegeben
          — nach 24 Monaten.
        </li>
      </ul>
      <h2>3. Registrierung & Konto</h2>
      <p>
        Die Nutzung setzt ein Konto voraus. Du bist verpflichtet, korrekte Angaben zu machen und
        dein Passwort geheim zu halten.
      </p>
      <h2>4. Verantwortung der Händler</h2>
      <p>
        Vergabe, Einlösung und Ausgestaltung von Rewards liegen in der Verantwortung der jeweiligen
        Partner. Zoryn stellt die Infrastruktur bereit.
      </p>
      <h2>5. Missbrauch</h2>
      <p>
        Manipulierte Buchungen, gefälschte Belege oder Umgehungsversuche führen zur sofortigen
        Sperrung.
      </p>
      <h2>6. Haftung</h2>
      <p>
        Zoryn haftet nach den gesetzlichen Vorschriften. Für Schäden aus leicht fahrlässiger
        Verletzung unwesentlicher Nebenpflichten ist die Haftung ausgeschlossen.
      </p>
      <h2>7. Änderungen</h2>
      <p>
        Zoryn kann diese AGB anpassen. Wir informieren dich mindestens 30 Tage vor Inkrafttreten in
        der App.
      </p>
      <h2>8. Anwendbares Recht</h2>
      <p>Es gilt deutsches Recht. Gerichtsstand ist Berlin, sofern gesetzlich zulässig.</p>
    </LegalLayout>
  ),
});
