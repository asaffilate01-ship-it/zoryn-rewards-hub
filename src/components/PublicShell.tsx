import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="border-b border-border/40 bg-gradient-to-b from-card/30 to-transparent">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        {eyebrow ? (
          <div className="mb-3 inline-flex rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs uppercase tracking-wide text-brand">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {description ? <p className="mt-4 text-lg text-muted-foreground">{description}</p> : null}
      </div>
    </section>
  );
}

export function LegalNotice() {
  return (
    <p className="rounded-2xl border border-border/60 bg-card/50 p-4 text-xs text-muted-foreground">
      Diese Seite wird vom Zoryn-Team gepflegt und beantwortet häufige Fragen zu Nutzung, Datenschutz und
      Sicherheit von Zoryn. Sie ersetzt keine unabhängige rechtliche Beratung und keine
      Zertifizierung. Der Schutz deiner Daten ist eine gemeinsame Verantwortung von Zoryn, unseren
      Partnern und dir.
    </p>
  );
}
