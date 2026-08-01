import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PublicShell, PageHeader, LegalNotice } from "@/components/PublicShell";
import { useT } from "@/lib/i18n";

function LegalLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <PublicShell>
      <PageHeader eyebrow={t("Rechtliches")} title={title} description={description} />
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
  component: TermsPage,
});

function TermsPage() {
  const t = useT();
  return (
    <LegalLayout
      title={t("Allgemeine Geschäftsbedingungen")}
      description={t("Die Nutzungsbedingungen der Zoryn-Plattform.")}
    >
      <h2>{t("1. Geltungsbereich")}</h2>
      <p>
        {t(
          "Diese AGB gelten für die Nutzung der Zoryn-Loyalty-Plattform (Web, PWA, Native-Apps) durch Verbraucher:innen sowie für Händler und deren Personal.",
        )}
      </p>
      <h2>{t("2. Zoryn-Wallet und Punkte")}</h2>
      <ul>
        <li>{t("100 Punkte entsprechen 1 € Gegenwert im Zoryn-Netzwerk.")}</li>
        <li>
          {t(
            "Punkte sind personengebunden, nicht übertragbar und werden über ein doppeltes Ledger-System verwaltet.",
          )}
        </li>
        <li>
          {t(
            "Punkte, die bei einem Partner gesammelt wurden, verfallen — sofern nicht anders angegeben — nach 24 Monaten.",
          )}
        </li>
      </ul>
      <h2>{t("3. Registrierung & Konto")}</h2>
      <p>
        {t(
          "Die Nutzung setzt ein Konto voraus. Du bist verpflichtet, korrekte Angaben zu machen und dein Passwort geheim zu halten.",
        )}
      </p>
      <h2>{t("4. Verantwortung der Händler")}</h2>
      <p>
        {t(
          "Vergabe, Einlösung und Ausgestaltung von Rewards liegen in der Verantwortung der jeweiligen Partner. Zoryn stellt die Infrastruktur bereit.",
        )}
      </p>
      <h2>{t("5. Missbrauch")}</h2>
      <p>
        {t(
          "Manipulierte Buchungen, gefälschte Belege oder Umgehungsversuche führen zur sofortigen Sperrung.",
        )}
      </p>
      <h2>{t("6. Haftung")}</h2>
      <p>
        {t(
          "Zoryn haftet nach den gesetzlichen Vorschriften. Für Schäden aus leicht fahrlässiger Verletzung unwesentlicher Nebenpflichten ist die Haftung ausgeschlossen.",
        )}
      </p>
      <h2>{t("7. Änderungen")}</h2>
      <p>
        {t(
          "Zoryn kann diese AGB anpassen. Wir informieren dich mindestens 30 Tage vor Inkrafttreten in der App.",
        )}
      </p>
      <h2>{t("8. Anwendbares Recht")}</h2>
      <p>{t("Es gilt deutsches Recht. Gerichtsstand ist Berlin, sofern gesetzlich zulässig.")}</p>
    </LegalLayout>
  );
}
