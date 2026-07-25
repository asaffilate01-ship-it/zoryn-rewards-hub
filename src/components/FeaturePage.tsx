import type { ComponentType, SVGProps } from "react";
import { Link } from "@tanstack/react-router";
import { PublicShell, PageHeader } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";

export interface FeatureItem {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
}

export function FeaturePage({
  eyebrow, title, description, features, ctaLabel = "Loslegen", ctaTo = "/app",
}: {
  eyebrow: string;
  title: string;
  description: string;
  features: FeatureItem[];
  ctaLabel?: string;
  ctaTo?: string;
}) {
  return (
    <PublicShell>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-3xl border border-border/60 bg-card/50 p-6">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-brand/40 bg-gradient-to-br from-brand/15 via-brand-alt/10 to-background p-8 text-center">
          <h3 className="font-display text-2xl font-semibold">Bereit für {title.split(" ")[0]}?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Starte in unter 60 Sekunden — kostenlos.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link to={ctaTo}>
              <Button className="bg-gradient-to-r from-brand to-brand-alt">{ctaLabel}</Button>
            </Link>
            <Link to="/legal/complaints">
              <Button variant="outline">Kontakt</Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
