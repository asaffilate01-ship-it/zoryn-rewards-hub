import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { isAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { ZorynMark } from "@/components/ZorynMark";
import {
  Shield,
  ArrowLeft,
  LayoutDashboard,
  Store,
  Inbox,
  FileText,
  BarChart3,
  Network,
} from "lucide-react";
import type { ComponentType } from "react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Zoryn" }] }),
  component: AdminShell,
});

const TABS: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { to: "/admin", label: "Übersicht", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/merchants", label: "Merchants", icon: Store },
  { to: "/admin/tenants", label: "Tenants", icon: Network },
  { to: "/admin/claims", label: "Reklamationen", icon: Inbox },
  { to: "/admin/audit", label: "Audit", icon: FileText },
];

function AdminShell() {
  const isAdminFn = useServerFn(isAdmin);
  const { data: allowed, isLoading } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => isAdminFn(),
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isLoading)
    return <div className="p-8 text-sm text-muted-foreground">Prüfe Berechtigungen…</div>;
  if (!allowed) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <Shield className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-3 font-display text-xl font-semibold">Kein Admin-Zugriff</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dieser Bereich ist Plattform-Administrator:innen vorbehalten.
        </p>
        <Link to="/app" className="mt-6 inline-block">
          <Button variant="secondary">Zurück zum Wallet</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between py-3.5">
            <Link to="/admin" className="flex items-center gap-2.5">
              <ZorynMark size={26} />
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[15px] font-semibold tracking-tight">Zoryn</span>
                <span className="rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                  Admin
                </span>
              </div>
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Zur App
            </Link>
          </div>
          <nav className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center gap-1">
              {TABS.map((t) => {
                const active =
                  t.to === "/admin" ? pathname === "/admin" : pathname.startsWith(t.to);
                const Icon = t.icon;
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                      active
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className={`size-4 ${active ? "text-primary" : ""}`} />
                    {t.label}
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
      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
