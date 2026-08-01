import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PublicShell, PageHeader } from "@/components/PublicShell";
import { listPosts } from "@/lib/blog.functions";
import { useT } from "@/lib/i18n";

const postsQuery = queryOptions({
  queryKey: ["blog", "posts"],
  queryFn: () => listPosts(),
});

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Zoryn" },
      {
        name: "description",
        content: "Neues aus dem Zoryn-Netzwerk: Produkt, Merchant-Stories und Erklärungen.",
      },
      { property: "og:title", content: "Blog — Zoryn" },
      { property: "og:description", content: "Produkt, Merchant-Stories und Erklärungen." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: BlogIndex,
});

function BlogIndex() {
  const t = useT();
  const { data } = useSuspenseQuery(postsQuery);
  return (
    <PublicShell>
      <PageHeader
        eyebrow={t("Blog")}
        title={t("Neues aus dem Zoryn-Netzwerk")}
        description={t("Produkt-Updates, Merchant-Stories und Erklärungen.")}
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        {data.posts.map((p) => (
          <Link
            key={p.id}
            to="/blog/$slug"
            params={{ slug: p.slug }}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/50 transition hover:border-brand/50"
          >
            <div
              className="aspect-[16/10] bg-gradient-to-br from-brand/30 via-brand-alt/20 to-background"
              style={
                p.cover_url
                  ? {
                      backgroundImage: `url(${p.cover_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            />
            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex flex-wrap gap-2">
                {p.tags?.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h2 className="font-display text-xl font-semibold leading-tight group-hover:text-brand">
                {p.title}
              </h2>
              <p className="text-sm text-muted-foreground">{p.excerpt}</p>
              <div className="mt-auto text-xs text-muted-foreground">
                {p.author_name} ·{" "}
                {p.published_at ? new Date(p.published_at).toLocaleDateString("de-DE") : ""}
              </div>
            </div>
          </Link>
        ))}
        {data.posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("Noch keine Beiträge.")}</p>
        ) : null}
      </section>
    </PublicShell>
  );
}
