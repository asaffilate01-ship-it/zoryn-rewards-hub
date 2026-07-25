import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/profile")({
  head: () => ({ meta: [{ title: "Profil — Zoryn" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    first_name: string | null;
    last_name: string | null;
    membership_number: string;
    country: string | null;
    preferred_language: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setEmail(userData.user.email ?? null);
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, membership_number, country, preferred_language")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (data) setProfile(data);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Profil</h1>

      <div className="mt-6 rounded-2xl border border-border bg-card/60 p-5">
        <Row label="Name" value={[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—"} />
        <Row label="E-Mail" value={email ?? "—"} />
        <Row label="Mitglieds-Nr." value={profile?.membership_number ?? "—"} />
        <Row label="Land" value={profile?.country ?? "—"} />
        <Row label="Sprache" value={profile?.preferred_language ?? "de"} />
      </div>

      <Button variant="outline" className="mt-6" onClick={signOut}>
        Abmelden
      </Button>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-b-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
