import { useEffect, useState } from "react";
import { Cookie, Settings2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  acceptAll,
  rejectAll,
  setConsent,
  useConsent,
  onOpenConsent,
  openConsent,
} from "@/lib/consent";

export function CookieConsent() {
  const consent = useConsent();
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);

  useEffect(() => {
    if (!consent.decided) {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, [consent.decided]);

  useEffect(
    () =>
      onOpenConsent(() => {
        setAnalytics(consent.analytics);
        setMarketing(consent.marketing);
        setOpen(true);
      }),
    [consent.analytics, consent.marketing],
  );

  return (
    <>
      {consent.decided ? (
        <button
          onClick={openConsent}
          aria-label="Cookie-Einstellungen"
          className="fixed bottom-4 left-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-border/60 bg-background/70 text-muted-foreground shadow-lg backdrop-blur-xl transition hover:text-brand"
        >
          <Cookie className="h-4 w-4" />
        </button>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 p-4 backdrop-blur-sm sm:items-center"
        >
          <div className="w-full max-w-lg rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand/15 text-brand">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 id="cookie-title" className="text-lg font-semibold">
                  Wir respektieren deine Privatsphäre
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Wir nutzen Cookies, damit Zoryn funktioniert und um die App zu verbessern. Du
                  entscheidest, was wir dürfen. Details in unserer{" "}
                  <Link to="/legal/cookies" className="text-brand underline underline-offset-2">
                    Cookie-Richtlinie
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Row
                title="Notwendig"
                desc="Sitzung, Sicherheit, Cookie-Einstellungen."
                locked
                checked
              />
              <Row
                title="Analyse"
                desc="Hilft uns zu verstehen, wie die App genutzt wird."
                checked={analytics}
                onChange={setAnalytics}
              />
              <Row
                title="Marketing"
                desc="Personalisiertere Angebote und Kampagnen."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  rejectAll();
                  setOpen(false);
                }}
              >
                Alle ablehnen
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setConsent({ analytics, marketing });
                  setOpen(false);
                }}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Auswahl speichern
              </Button>
              <Button
                className="ml-auto"
                onClick={() => {
                  acceptAll();
                  setOpen(false);
                }}
              >
                Alle akzeptieren
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Row({
  title,
  desc,
  checked,
  onChange,
  locked,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background/40 p-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={locked} aria-label={title} />
    </div>
  );
}
