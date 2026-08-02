import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Gauge,
  Store,
  Megaphone,
  Landmark,
  FlaskConical,
  Rocket,
  CreditCard,
  Scale,
} from "lucide-react";
import { ZorynMark } from "@/components/ZorynMark";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useT } from "@/lib/i18n";

export const PLATFORM_TABS = [
  { to: "/rewards-production", label: "Produktion", icon: Gauge },
  { to: "/merchant-onboarding", label: "Onboarding", icon: Store },
  { to: "/campaign-studio", label: "Campaign Studio", icon: Megaphone },
  { to: "/liability-centre", label: "Liability Centre", icon: Landmark },
  { to: "/reconciliation", label: "Abstimmung", icon: Scale },
  { to: "/billing", label: "Abrechnung", icon: CreditCard },
  { to: "/rewards-scenario-lab", label: "Scenario Lab", icon: FlaskConical },
  { to: "/go-live-readiness", label: "Go-Live", icon: Rocket },
] as const;


export function formatEuroCents(cents: number, locale = "de-DE") {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(
    (Number(cents) || 0) / 100,
  );
}

export function formatNumber(value: number, locale = "de-DE") {
  return new Intl.NumberFormat(locale).format(Number(value) || 0);
}

export function PlatformShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between py-3.5">
            <Link to="/rewards-production" className="flex items-center gap-2.5">
              <ZorynMark size={26} />
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[15px] font-semibold tracking-tight">Zoryn</span>
                <span className="rounded-full border border-border/70 bg-card/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Rewards SaaS
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Link
                to="/app"
                className="rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                {t("Zur Wallet")}
              </Link>
            </div>
          </div>

          <nav className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center gap-1">
              {PLATFORM_TABS.map((tab) => {
                const active = pathname.startsWith(tab.to);
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                      active
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className={`size-4 ${active ? "text-primary" : ""}`} />
                    {t(tab.label)}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-2 h-[2px] rounded-full gradient-brand" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-sm font-semibold text-primary">{t(eyebrow)}</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {t(title)}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t(description)}</p>
        <div className="mt-8 space-y-6">{children}</div>
      </main>
    </div>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t(label)}
      </p>
      <p className="font-display mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{t(hint)}</p>}
    </div>
  );
}
