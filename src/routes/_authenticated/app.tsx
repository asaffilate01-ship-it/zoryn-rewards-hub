import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QrCode, ShoppingBag, Wallet, MapPin, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ZorynMark } from "@/components/ZorynMark";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Wallet — Zoryn" },
      { name: "description", content: "Deine Zoryn-Wallet, Punkte und Angebote." },
    ],
  }),
  component: AppHome,
});

function AppHome() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [membership, setMembership] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, membership_number")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (profile) {
        setFirstName(profile.first_name);
        setMembership(profile.membership_number);
      }
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <ZorynMark size={28} />
            <span className="font-display font-semibold">Zoryn</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Abmelden
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="text-sm text-muted-foreground">
          Guten Tag{firstName ? `, ${firstName}` : ""}
        </div>

        <div className="surface-glass glow-brand mt-4 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Universelle Wallet
            </div>
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-brand-soft">
              Bronze
            </span>
          </div>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-display text-5xl font-semibold">0</span>
            <span className="text-sm text-muted-foreground">Punkte</span>
          </div>
          <div className="text-sm text-brand-soft">≈ 0,00 €</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Mitglieds-Nr. {membership ?? "—"}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <Action icon={QrCode} label="Scannen" />
            <Action icon={ShoppingBag} label="Shoppen" />
            <Action icon={Wallet} label="Einlösen" />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Los geht's</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Deine Wallet ist bereit. Ledger, Händlerdirektory und QR-Sammeln kommen
            in Kürze — wir bauen Zoryn Stück für Stück auf.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Placeholder icon={MapPin} title="In deiner Nähe" body="Bald: teilnehmende Händler in deinem Kiez." />
            <Placeholder icon={ShoppingBag} title="Online-Shops" body="Bald: Belohnungen bei tausenden Online-Händlern." />
          </div>
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-around px-4 py-3 text-xs">
          <TabItem icon={Wallet} label="Home" active />
          <TabItem icon={ShoppingBag} label="Shop" />
          <ScanCta />
          <TabItem icon={MapPin} label="Nearby" />
          <TabItem icon={User} label="Profil" />
        </div>
      </nav>
    </div>
  );
}

function Action({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button className="rounded-xl bg-secondary/60 px-3 py-3 text-center text-xs transition hover:bg-secondary">
      <Icon className="mx-auto mb-1 size-5 text-brand-soft" />
      {label}
    </button>
  );
}

function Placeholder({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <Icon className="size-5 text-brand-soft" />
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{body}</div>
    </div>
  );
}

function TabItem({ icon: Icon, label, active }: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-1 ${active ? "text-foreground" : "text-muted-foreground"}`}>
      <Icon className="size-5" />
      {label}
    </button>
  );
}

function ScanCta() {
  return (
    <button
      aria-label="Scan"
      className="-mt-6 flex size-14 items-center justify-center rounded-full gradient-brand text-primary-foreground shadow-lg glow-brand"
    >
      <QrCode className="size-6" />
    </button>
  );
}
