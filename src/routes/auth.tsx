import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ZorynWordmark } from "@/components/ZorynMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Anmelden — Zoryn" },
      {
        name: "description",
        content:
          "Melde dich bei Zoryn an oder erstelle deine Wallet in 30 Sekunden.",
      },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Ungültige E-Mail").max(255),
  password: z.string().min(6, "Mind. 6 Zeichen").max(72),
});

const signUpSchema = signInSchema.extend({
  first_name: z.string().trim().min(1, "Vorname erforderlich").max(50),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // If already signed in, hop to /app
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Willkommen zurück");
    navigate({ to: "/app" });
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
      first_name: form.get("first_name"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin + "/app",
        data: { first_name: parsed.data.first_name, preferred_language: "de" },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Wallet erstellt — willkommen bei Zoryn");
    navigate({ to: "/app" });
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google-Anmeldung fehlgeschlagen");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app" });
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 -z-10 opacity-50 gradient-brand blur-3xl" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <Link to="/" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Zurück
        </Link>

        <div className="mb-8">
          <ZorynWordmark />
        </div>

        <div className="surface-glass rounded-2xl p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Deine Wallet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ein Konto. Punkte, Cashback und Angebote im gesamten Zoryn-Netzwerk.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            <GoogleIcon /> Mit Google fortfahren
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            oder mit E-Mail
            <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Anmelden</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="si-email">E-Mail</Label>
                  <Input id="si-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div>
                  <Label htmlFor="si-password">Passwort</Label>
                  <Input id="si-password" name="password" type="password" autoComplete="current-password" required />
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-brand text-primary-foreground border-0">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : "Anmelden"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="su-name">Vorname</Label>
                  <Input id="su-name" name="first_name" required maxLength={50} />
                </div>
                <div>
                  <Label htmlFor="su-email">E-Mail</Label>
                  <Input id="su-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div>
                  <Label htmlFor="su-password">Passwort</Label>
                  <Input id="su-password" name="password" type="password" autoComplete="new-password" required minLength={6} />
                  <p className="mt-1 text-xs text-muted-foreground">Mindestens 6 Zeichen.</p>
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-brand text-primary-foreground border-0">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : "Wallet erstellen"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Mit der Registrierung akzeptierst du unsere AGB und Datenschutzerklärung.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mr-2 size-4">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.3-1.7 3.8-5.4 3.8-3.24 0-5.9-2.7-5.9-6s2.66-6 5.9-6c1.85 0 3.08.79 3.79 1.47l2.58-2.5C16.9 3.4 14.72 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6s4.1 9.2 9.2 9.2c5.32 0 8.83-3.74 8.83-9 0-.6-.07-1.06-.15-1.6H12z"/>
    </svg>
  );
}
