import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  QrCode,
  Wallet,
  MapPin,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Users,
  Building2,
} from "lucide-react";
import heroBg from "@/assets/hero-aurora.jpg";
import { ZorynMark } from "@/components/ZorynMark";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/PublicShell";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zoryn — Mehr als nur Punkte." },
      {
        name: "description",
        content:
          "Zoryn ist die eine Wallet für Punkte, Cashback, Affiliate-Shopping, lokale Angebote und Händlerbelohnungen. Ein Konto. Jedes Angebot.",
      },
      { property: "og:title", content: "Zoryn — Mehr als nur Punkte." },
      {
        property: "og:description",
        content:
          "Eine Wallet. Punkte, Cashback, lokale Angebote und exklusive Belohnungen im gesamten Zoryn-Netzwerk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const consumerFeatures = [
  {
    icon: Wallet,
    title: "Eine Wallet für alles",
    body: "Universelle Punkte, händlerspezifische Punkte und Cashback in einem Konto — mit klarem Euro-Gegenwert.",
  },
  {
    icon: MapPin,
    title: "In deinem Kiez",
    body: "Lokale Cafés, Barber, Kinos: Punkte sammeln und einlösen bei allen Zoryn-Partnern in deiner Nähe.",
  },
  {
    icon: ShoppingBag,
    title: "Online mitshoppen",
    body: "Belohnungen bei tausenden Online-Händlern über unser Affiliate-Netzwerk — automatisch getrackt.",
  },
  {
    icon: QrCode,
    title: "Schnell am POS",
    body: "QR scannen, Punkte sammeln, Punkte einlösen. Ohne Karte, ohne Umwege.",
  },
];

const platformStack = [
  {
    icon: Building2,
    label: "Für Händler",
    body: "Programme, Kampagnen, Filialen, Personal, Abrechnung — alles in einem Portal.",
  },
  {
    icon: Users,
    label: "LoungeTech-Netzwerk",
    body: "Kiezio, Rettio, Haccora, TrainDirekt und weitere Apps teilen dieselbe Zoryn-Wallet.",
  },
  {
    icon: ShieldCheck,
    label: "Sicher & konform",
    body: "Doppelte Buchführung, RLS, Betrugserkennung, DSGVO — von Grund auf gebaut.",
  },
];

function LandingPage() {
  const t = useT();
  return (
    <PublicShell>
      <div className="text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `url(${heroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

          <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pt-20 pb-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <Sparkles className="size-3.5 text-brand-soft" />
                <span>{t("Neu: Eine Loyalty-Infrastruktur für ganz Europa")}</span>
              </div>

              <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                <span className="gradient-brand-text">{t("Mehr als")}</span>
                <br />
                {t("nur Punkte.")}
              </h1>

              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                {t(
                  "Zoryn ist die eine Wallet für Punkte, Cashback, Affiliate-Shopping, lokale Angebote und Händlerbelohnungen. Ein Konto — jedes Angebot, online und im Kiez.",
                )}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="gradient-brand text-primary-foreground border-0 glow-brand"
                >
                  <Link to="/auth">
                    {t("Kostenlos starten")} <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#merchants">{t("Für Händler")}</a>
                </Button>
              </div>

              <div className="mt-10 grid max-w-md grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-2xl font-semibold text-foreground">100 pts</div>
                  <div className="text-xs text-muted-foreground">= 1,00 €</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground">1 App</div>
                  <div className="text-xs text-muted-foreground">{t("für alle Händler")}</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground">EU</div>
                  <div className="text-xs text-muted-foreground">{t("gehostet")}</div>
                </div>
              </div>
            </div>

            {/* Wallet preview card */}
            <div className="relative">
              <div className="surface-glass glow-brand relative mx-auto max-w-sm rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ZorynMark size={28} />
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Wallet
                    </span>
                  </div>
                  <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand-soft">
                    Gold
                  </span>
                </div>

                <div className="mt-8">
                  <div className="text-xs text-muted-foreground">{t("Guten Abend, Amer")}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-semibold tracking-tight">
                      4.850
                    </span>
                    <span className="text-sm text-muted-foreground">{t("Punkte")}</span>
                  </div>
                  <div className="text-sm text-brand-soft">≈ 48,50 €</div>
                </div>

                <div className="mt-6 flex gap-2">
                  <div className="flex-1 rounded-xl bg-secondary/60 px-3 py-2 text-center text-xs">
                    <QrCode className="mx-auto mb-1 size-4 text-brand-soft" />
                    {t("Scannen")}
                  </div>
                  <div className="flex-1 rounded-xl bg-secondary/60 px-3 py-2 text-center text-xs">
                    <ShoppingBag className="mx-auto mb-1 size-4 text-brand-soft" />
                    {t("Shoppen")}
                  </div>
                  <div className="flex-1 rounded-xl bg-secondary/60 px-3 py-2 text-center text-xs">
                    <Wallet className="mx-auto mb-1 size-4 text-brand-soft" />
                    {t("Einlösen")}
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-muted-foreground">Café Berlin</span>
                    <span className="font-medium text-success">+120 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("Ausstehend")}</span>
                    <span className="font-medium text-warning">620 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("Eine Wallet. Jedes Angebot.")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t(
                "Sammle Punkte beim Bäcker um die Ecke, beim Online-Shop und über LoungeTech-Apps — und löse sie überall im Zoryn-Netzwerk ein.",
              )}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {consumerFeatures.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="surface-glass rounded-2xl p-6 transition hover:border-brand/40"
              >
                <div className="inline-flex size-11 items-center justify-center rounded-xl gradient-brand">
                  <Icon className="size-5 text-primary-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{t(title)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(body)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Merchants */}
        <section id="merchants" className="relative border-t border-border">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-soft">
                {t("Für Händler")}
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("Baue Wiederbesucher — nicht nur Umsatz.")}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {t(
                  "Zoryn gibt dir händlerspezifische Punkte, universelle Netzwerkpunkte, Kampagnen, Abrechnung und Betrugsschutz in einem Portal. Starte in Minuten, wachse mit dem Netzwerk.",
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="gradient-brand text-primary-foreground border-0"
                >
                  <Link to="/auth">{t("Händler werden")}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#network">{t("Netzwerk kennenlernen")}</a>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Kampagnen", "Ziel → Zielgruppe → Reward → Live in Minuten."],
                ["Doppelte Buchführung", "Jeder Punkt hat eine Deckung. Immer."],
                ["Filialen & Personal", "Rollen, Limits, Kassierer, Analysten."],
                ["Abrechnung", "Wöchentliche Auszüge, EU-konform."],
              ].map(([title, b]) => (
                <div key={title} className="surface-glass rounded-2xl p-5">
                  <div className="text-sm font-semibold">{t(title)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t(b)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Network */}
        <section id="network" className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-8 md:grid-cols-3">
            {platformStack.map(({ icon: Icon, label, body }) => (
              <div key={label} className="rounded-2xl border border-border bg-card/60 p-6">
                <Icon className="size-6 text-brand-soft" />
                <div className="mt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(label)}
                </div>
                <p className="mt-2 text-base text-foreground">{t(body)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-24 text-center">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("Deine Wallet wartet.")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t(
                "Erstelle in 30 Sekunden dein Zoryn-Konto und starte mit einem Willkommensbonus.",
              )}
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="gradient-brand text-primary-foreground border-0 glow-brand"
              >
                <Link to="/auth">
                  {t("Kostenlos starten")} <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
