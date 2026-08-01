import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search as SearchIcon, Store, Sparkles, Gift } from "lucide-react";
import { PublicShell, PageHeader } from "@/components/PublicShell";
import { Input } from "@/components/ui/input";
import { globalSearch, type SearchHit } from "@/lib/analytics.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Suche — Zoryn" },
      { name: "description", content: "Finde Geschäfte, Angebote und Prämien bei Zoryn." },
      { property: "og:title", content: "Suche — Zoryn" },
      { property: "og:description", content: "Durchsuche das Zoryn-Netzwerk." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const t = useT();
  const [q, setQ] = useState("");
  const searchFn = useServerFn(globalSearch);
  const { data, isFetching } = useQuery({
    queryKey: ["globalSearch", q],
    queryFn: () => searchFn({ data: { q } }),
    enabled: q.trim().length >= 2,
  });

  const hits = (data ?? []) as SearchHit[];

  return (
    <PublicShell>
      <PageHeader
        eyebrow={t("Entdecken")}
        title={t("Suche im Zoryn-Netzwerk")}
        description={t("Geschäfte, Angebote und Prämien.")}
      />
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Café, Bäckerei, Rabatt…")}
            className="h-14 rounded-2xl border-border/70 bg-card/50 pl-11 text-base"
          />
        </div>

        <div className="mt-6">
          {q.trim().length < 2 && (
            <p className="text-sm text-muted-foreground">{t("Gib mindestens 2 Zeichen ein.")}</p>
          )}
          {isFetching && <p className="text-sm text-muted-foreground">{t("Suche läuft…")}</p>}
          {q.trim().length >= 2 && !isFetching && hits.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('Nichts gefunden für „X".').replace("X", q)}
            </p>
          )}
          <ul className="mt-2 space-y-2">
            {hits.map((h) => (
              <li key={`${h.kind}-${h.id}`}>
                <ResultRow hit={h} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PublicShell>
  );
}

function ResultRow({ hit }: { hit: SearchHit }) {
  const t = useT();
  const Icon = hit.kind === "merchant" ? Store : hit.kind === "offer" ? Sparkles : Gift;
  const label =
    hit.kind === "merchant"
      ? t("Geschäft")
      : hit.kind === "offer"
        ? t("Angebot")
        : t("Prämie");
  return (
    <Link
      to="/app"
      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 transition hover:border-brand/50 hover:bg-card/70"
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{hit.title}</span>
          <span className="rounded-full border border-border/70 bg-background/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        {hit.subtitle && (
          <div className="truncate text-xs text-muted-foreground">{hit.subtitle}</div>
        )}
      </div>
    </Link>
  );
}
