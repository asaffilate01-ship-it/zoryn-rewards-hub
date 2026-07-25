import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Wallet, ShoppingBag, MapPin, User, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ZorynMark } from "@/components/ZorynMark";
import { Button } from "@/components/ui/button";
import type { ComponentType } from "react";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/app" className="flex items-center gap-2">
            <ZorynMark size={28} />
            <span className="font-display font-semibold">Zoryn</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Abmelden
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-around px-4 py-3 text-xs">
          <TabLink to="/app" icon={Wallet} label="Wallet" active={pathname === "/app"} />
          <TabLink to="/app/shop" icon={ShoppingBag} label="Shop" active={pathname.startsWith("/app/shop")} />
          <ScanCta />
          <TabLink to="/app/nearby" icon={MapPin} label="Nearby" active={pathname.startsWith("/app/nearby")} />
          <TabLink to="/app/profile" icon={User} label="Profil" active={pathname.startsWith("/app/profile")} />
        </div>
      </nav>
    </div>
  );
}

function TabLink({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 transition ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

function ScanCta() {
  return (
    <Link
      to="/app/scan"
      aria-label="Scan"
      className="-mt-6 flex size-14 items-center justify-center rounded-full gradient-brand text-primary-foreground shadow-lg glow-brand"
    >
      <QrCode className="size-6" />
    </Link>
  );
}
