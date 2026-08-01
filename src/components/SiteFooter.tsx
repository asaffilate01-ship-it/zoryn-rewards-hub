import { Link } from "@tanstack/react-router";
import { ZorynMark } from "@/components/ZorynMark";
import { SocialRow } from "@/components/SocialIcons";
import { LanguageToggle } from "@/components/LanguageToggle";
import { openConsent } from "@/lib/consent";
import { useT } from "@/lib/i18n";

const cols = [
  {
    title: "Produkt",
    links: [
      { to: "/features/consumers", label: "Für dich" },
      { to: "/features/merchants", label: "Für Unternehmen" },
      { to: "/features/staff", label: "Für Personal" },
      { to: "/features/enterprise", label: "Ketten & Franchise" },
    ],
  },
  {
    title: "Plattform",
    links: [
      { to: "/features/developers", label: "Entwickler" },
      { to: "/features/partners", label: "Partner & Affiliate" },
      { to: "/blog", label: "Blog" },
      { to: "/app", label: "App öffnen" },
    ],
  },
  {
    title: "Recht",
    links: [
      { to: "/legal/terms", label: "AGB" },
      { to: "/legal/privacy", label: "Datenschutz" },
      { to: "/legal/imprint", label: "Impressum" },
      { to: "/legal/cookies", label: "Cookies" },
      { to: "/legal/gdpr", label: "DSGVO" },
      { to: "/legal/aml", label: "AML / KYC" },
      { to: "/legal/accessibility", label: "Barrierefreiheit" },
      { to: "/legal/complaints", label: "Beschwerden" },
    ],
  },
] as const;

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-3">
            <ZorynMark size={40} />
            <div>
              <div className="font-display text-lg font-semibold">Zoryn</div>
              <div className="text-xs text-muted-foreground">{t("Mehr als nur Punkte.")}</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            {t(
              "Eine Wallet für Punkte, Cashback, Angebote und Rewards — bei allen Zoryn-Partnern.",
            )}
          </p>
          <SocialRow className="mt-5" />
          <LanguageToggle className="mt-5" />
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-sm font-semibold">{t(c.title)}</div>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    {t(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/40 bg-background/40">
        <div
          className="mx-auto flex h-18 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6"
          style={{ height: "72px" }}
        >
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Zoryn. {t("Alle Rechte vorbehalten.")}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <button onClick={openConsent} className="transition hover:text-foreground">
              {t("Cookie-Einstellungen")}
            </button>
            <span className="opacity-40">·</span>
            <Link to="/legal/privacy" className="transition hover:text-foreground">
              {t("Datenschutz")}
            </Link>
            <span className="opacity-40">·</span>
            <Link to="/legal/imprint" className="transition hover:text-foreground">
              {t("Impressum")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
