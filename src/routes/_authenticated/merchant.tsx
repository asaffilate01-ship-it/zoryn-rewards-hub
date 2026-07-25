import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Store, Users, Settings, ScanLine, ArrowLeft, Sparkles, Gift, Wallet } from "lucide-react";
import { ZorynMark } from "@/components/ZorynMark";
import { Button } from "@/components/ui/button";
import type { ComponentType } from "react";

export const Route = createFileRoute("/_authenticated/merchant")({
  component: MerchantShell,
});

function MerchantShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/merchant" className="flex items-center gap-2">
            <ZorynMark size={26} />
            <span className="font-display font-semibold">Zoryn Business</span>
          </Link>
          <Link to="/app">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 size-4" /> Wallet
            </Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-around px-4 py-3 text-xs">
          <TabLink to="/merchant" icon={Store} label="Übersicht" active={pathname === "/merchant"} />
          <TabLink to="/merchant/pos" icon={ScanLine} label="Kasse" active={pathname.startsWith("/merchant/pos")} />
          <TabLink to="/merchant/offers" icon={Sparkles} label="Angebote" active={pathname.startsWith("/merchant/offers")} />
          <TabLink to="/merchant/rewards" icon={Gift} label="Rewards" active={pathname.startsWith("/merchant/rewards")} />
          <TabLink to="/merchant/funding" icon={Wallet} label="Guthaben" active={pathname.startsWith("/merchant/funding")} />

          <TabLink to="/merchant/team" icon={Users} label="Team" active={pathname.startsWith("/merchant/team")} />
          <TabLink to="/merchant/settings" icon={Settings} label="Einstellungen" active={pathname.startsWith("/merchant/settings")} />
        </div>
      </nav>
    </div>
  );
}

function TabLink({
  to, icon: Icon, label, active,
}: { to: string; icon: ComponentType<{ className?: string }>; label: string; active?: boolean }) {
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 transition ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
