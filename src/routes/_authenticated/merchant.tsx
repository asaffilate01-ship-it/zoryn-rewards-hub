import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Store,
  Users,
  Settings,
  ScanLine,
  ArrowLeft,
  Sparkles,
  Gift,
  Wallet,
  BarChart3,
  Megaphone,
  PlugZap,
} from "lucide-react";
import { ZorynMark } from "@/components/ZorynMark";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useT } from "@/lib/i18n";
import type { ComponentType } from "react";

export const Route = createFileRoute("/_authenticated/merchant")({
  component: MerchantShell,
});

const TABS: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { to: "/merchant", label: "Übersicht", icon: Store },
  { to: "/merchant/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/merchant/pos", label: "Kasse", icon: ScanLine },
  { to: "/merchant/offers", label: "Angebote", icon: Sparkles },
  { to: "/merchant/campaigns", label: "Kampagnen", icon: Megaphone },
  { to: "/merchant/rewards", label: "Rewards", icon: Gift },
  { to: "/merchant/funding", label: "Guthaben", icon: Wallet },
  { to: "/merchant/team", label: "Team", icon: Users },
  { to: "/merchant/integrations", label: "Integrationen", icon: PlugZap },
  { to: "/merchant/settings", label: "Einstellungen", icon: Settings },
];

function isActive(pathname: string, to: string) {
  return to === "/merchant" ? pathname === "/merchant" : pathname.startsWith(to);
}

function MerchantShell() {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between py-3.5">
            <Link to="/merchant" className="flex items-center gap-2.5">
              <ZorynMark size={26} />
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[15px] font-semibold tracking-tight">Zoryn</span>
                <span className="rounded-full border border-border/70 bg-card/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Business
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> {t("Zur Wallet")}
              </Link>
            </div>
          </div>

          {/* Segmented nav — scrolls on mobile */}
          <nav className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center gap-1">
              {TABS.map((tab) => {
                const active = isActive(pathname, tab.to);
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`group relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
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
        <Outlet />
      </main>
    </div>
  );
}
