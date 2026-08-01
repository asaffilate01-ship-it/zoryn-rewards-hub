import { useEffect } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Facebook, Linkedin, Link as LinkIcon, MessageCircle, Twitter } from "lucide-react";
import { toast } from "sonner";
import { PublicShell } from "@/components/PublicShell";
import { MarkdownLite } from "@/components/MarkdownLite";
import { SocialRow } from "@/components/SocialIcons";
import { getPost } from "@/lib/blog.functions";
import { setHeadOverride } from "@/lib/head-locale";
import { useLocale, useT } from "@/lib/i18n";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "post", slug],
    queryFn: () => getPost({ data: { slug } }),
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!res.post) throw notFound();
    return res;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData?.post) {
      return {
        meta: [{ title: "Beitrag nicht gefunden — Zoryn" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.post;
    const meta = [
      { title: `${p.title} — Zoryn Blog` },
      { name: "description", content: p.excerpt },
      { property: "og:title", content: p.title },
      { property: "og:description", content: p.excerpt },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `/blog/${params.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (p.cover_url) {
      meta.push({ property: "og:image", content: p.cover_url });
      meta.push({ name: "twitter:image", content: p.cover_url });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.title,
            description: p.excerpt,
            author: { "@type": "Organization", name: p.author_name },
            datePublished: p.published_at,
            image: p.cover_url ? [p.cover_url] : undefined,
          }),
        },
      ],
    };
  },
  component: BlogPost,
});

function BlogPost() {
  const t = useT();
  const { locale } = useLocale();
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const post = data.post!;
  const pick = (de: string, en: string | null) => (locale === "en" && en ? en : de);
  const title = pick(post.title, post.title_en);
  const bodyMd = pick(post.body_md, post.body_md_en);
  const excerpt = pick(post.excerpt, post.excerpt_en);

  // Head tags render server-side in German; align them with the reader's locale.
  useEffect(() => {
    setHeadOverride({ title: `${title} — Zoryn Blog`, description: excerpt });
    return () => setHeadOverride(null);
  }, [title, excerpt]);

  const url = typeof window !== "undefined" ? window.location.href : `/blog/${slug}`;
  const enc = encodeURIComponent(url);
  const encT = encodeURIComponent(title);

  const share = [
    { label: "X", icon: Twitter, href: `https://twitter.com/intent/tweet?url=${enc}&text=${encT}` },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
    },
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encT}%20${enc}` },
  ];

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {post.tags?.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {post.author_name} ·{" "}
          {post.published_at ? new Date(post.published_at).toLocaleDateString(locale === "en" ? "en-GB" : "de-DE") : ""}
        </p>
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={title}
            className="mt-8 aspect-[16/9] w-full rounded-3xl object-cover"
          />
        ) : (
          <div className="mt-8 aspect-[16/9] w-full rounded-3xl bg-gradient-to-br from-brand/30 via-brand-alt/20 to-background" />
        )}
        <div className="mt-10 text-base leading-relaxed">
          <MarkdownLite source={bodyMd} />
        </div>

        <div className="mt-12 rounded-3xl border border-border/60 bg-card/40 p-5">
          <p className="text-sm font-medium">{t("Teilen")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {share.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <s.icon className="h-3.5 w-3.5" /> {s.label}
              </a>
            ))}
            <button
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success(t("Link kopiert"));
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <LinkIcon className="h-3.5 w-3.5" /> {t("Link kopieren")}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <SocialRow />
        </div>
      </article>
    </PublicShell>
  );
}
