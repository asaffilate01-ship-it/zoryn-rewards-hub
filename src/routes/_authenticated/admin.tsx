import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { isAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { ZorynMark } from "@/components/ZorynMark";
import { Shield, ArrowLeft, LayoutDashboard, Store, Inbox, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Zoryn" }] }),
  component: AdminShell,
});

function AdminShell() {
  const isAdminFn = useServerFn(isAdmin);
  const { data: allowed, isLoading } = useQuery({ queryKey: ["isAdmin"], queryFn: () => isAdminFn() });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Prüfe Berechtigungen…</div>;
  if (!allowed) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <Shield className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-3 font-display text-xl font-semibold">Kein Admin-Zugriff</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dieser Bereich ist Plattform-Administrator:innen vorbehalten.
        </p>
        <Link to="/app" className="mt-6 inline-block"><Button variant="secondary">Zurück zum Wallet</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/admin" className="flex items-center gap-2">
            <ZorynMark size={26} />
            <span className="font-display font-semibold">Zoryn Admin</span>
          </Link>
          <Link to="/app"><Button variant="ghost" size="sm"><ArrowLeft className="mr-1 size-4" /> App</Button></Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <nav className="flex flex-wrap gap-2 border-b border-border pb-3">
          <Tab to="/admin" label="Übersicht" icon={LayoutDashboard} active={pathname === "/admin"} />
          <Tab to="/admin/merchants" label="Merchants" icon={Store} active={pathname.startsWith("/admin/merchants")} />
          <Tab to="/admin/claims" label="Reklamationen" icon={Inbox} active={pathname.startsWith("/admin/claims")} />
          <Tab to="/admin/audit" label="Audit" icon={FileText} active={pathname.startsWith("/admin/audit")} />
        </nav>
      </div>
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function Tab({ to, label, icon: Icon, active }: {
  to: string; label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean;
}) {
  return (
    <Link to={to} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
    }`}>
      <Icon className="size-4" /> {label}
    </Link>
  );
}
