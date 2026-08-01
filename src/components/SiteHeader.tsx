import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { ZorynMark } from "@/components/ZorynMark";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useT } from "@/lib/i18n";

const nav = [
  { to: "/features/consumers", label: "Für dich" },
  { to: "/features/merchants", label: "Für Unternehmen" },
  { to: "/blog", label: "Blog" },
  { to: "/legal/imprint", label: "Über" },
];

export function SiteHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div
        className="mx-auto flex h-26 max-w-7xl items-center gap-4 px-4 sm:px-6"
        style={{ height: "104px" }}
      >
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Zoryn Home">
          <ZorynMark size={56} />
          <div className="min-w-0 leading-tight">
            <div className="font-display text-2xl font-semibold tracking-tight">Zoryn</div>
            <div className="hidden text-xs text-muted-foreground sm:block">
              {t("Mehr als nur Punkte.")}
            </div>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-card/60 hover:text-foreground"
              activeProps={{
                className: "rounded-full px-4 py-2 text-sm text-foreground bg-card/70",
              }}
            >
              {t(n.label)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <LanguageToggle className="hidden sm:inline-flex" />
          <Link to="/search" aria-label={t("Suche")} className="hidden sm:inline-flex">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">
              {t("Anmelden")}
            </Button>
          </Link>
          <Link to="/app">
            <Button
              size="sm"
              className="bg-gradient-to-r from-brand to-brand-alt text-primary-foreground shadow-lg"
            >
              {t("App öffnen")}
            </Button>
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-border/60 md:hidden"
            aria-label={t("Menü")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-card/60 hover:text-foreground"
              >
                {t(n.label)}
              </Link>
            ))}
            <Link
              to="/auth"
              className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-card/60 hover:text-foreground"
            >
              {t("Anmelden")}
            </Link>
            <div className="px-3 py-2">
              <LanguageToggle />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
