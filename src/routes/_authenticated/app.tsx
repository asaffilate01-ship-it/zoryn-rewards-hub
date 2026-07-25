import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Wallet, ShoppingBag, MapPin, User, QrCode, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ZorynMark } from "@/components/ZorynMark";
import { listNotifications } from "@/lib/notifications.functions";
import type { ComponentType } from "react";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const listFn = useServerFn(listNotifications);
  const { data: notifs } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listFn(),
    refetchInterval: 60_000,
  });
  const unread = (notifs ?? []).filter((n) => !n.read_at).length;

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Link to="/app" className="flex items-center gap-2.5">
            <ZorynMark size={28} />
            <span className="font-display text-[15px] font-semibold tracking-tight">Zoryn</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/app/notifications"
              aria-label="Benachrichtigungen"
              className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground"
            >
              <Bell className="size-[18px]" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <button
              onClick={signOut}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-card hover:text-foreground"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <Outlet />
      </main>

      {/* Floating pill nav */}
      <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="pointer-events-auto relative flex items-center gap-1 rounded-full border border-border/70 bg-card/80 px-2 py-2 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <TabLink to="/app" icon={Wallet} label="Wallet" active={pathname === "/app"} />
          <TabLink to="/app/shop" icon={ShoppingBag} label="Shop" active={pathname.startsWith("/app/shop")} />
          <ScanCta active={pathname.startsWith("/app/scan")} />
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
      aria-label={label}
      className={`group relative flex h-11 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium transition-all ${
        active
          ? "bg-foreground/[0.06] text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className={`size-[18px] transition ${active ? "text-primary" : ""}`} />
      <span className={`hidden sm:inline ${active ? "" : "opacity-70"}`}>{label}</span>
    </Link>
  );
}

function ScanCta({ active }: { active?: boolean }) {
  return (
    <Link
      to="/app/scan"
      aria-label="Scannen"
      className={`relative mx-1 flex size-12 items-center justify-center rounded-full gradient-brand text-primary-foreground shadow-lg transition ${
        active ? "scale-105 glow-brand" : "hover:scale-105"
      }`}
    >
      <QrCode className="size-[22px]" />
    </Link>
  );
}
