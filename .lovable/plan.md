# Zoryn — Public Site, Compliance & Polish

Scope covers the public-facing site (marketing shell, legal, blog, cookies) plus the requested menu polish and a small "next phase" batch (stakeholder feature pages). Consumer/merchant/admin app shells stay as-is functionally — only sizing tweaks land there.

## 1. Global chrome (public site only)

New shared components rendered inside `__root.tsx` for non-`/app`, non-`/merchant`, non-`/admin` routes.

- **`SiteHeader`** — sticky, glass, height `h-26` (104 px). Contains: `ZorynMark` (large, matches header height with padding) + wordmark + slogan on desktop, primary nav (Produkt, Für Unternehmen, Blog, Preise, Kontakt), and CTAs (Anmelden / App öffnen).
- **`SiteFooter`** — height band `h-18` per row (72 px) for the utility strip; multi-row footer with brand column, product/business/legal/company link groups, newsletter stub, and a bottom utility strip (© Zoryn, language, socials).
- **Social icons** — TikTok, X, Facebook, YouTube, Instagram, LinkedIn. Lucide covers Facebook/Instagram/Linkedin/Youtube/Twitter(X); TikTok is added as a lightweight inline SVG component. All open in a new tab with `rel="noopener"`.
- **`BackToTop`** — fixed bottom-right button that appears past 400 px scroll. Circular SVG progress ring reflects scroll percentage; click smooth-scrolls to top. Uses `requestAnimationFrame` on scroll.

## 2. Menu polish

- App consumer bottom-nav: tighten label/icon rhythm, ensure the pill nav doesn't overlap safe-area (add `pb-[env(safe-area-inset-bottom)]`).
- Merchant/admin tab bars: add subtle active glow and ensure horizontal scroll snap on mobile.
- Public `SiteHeader` gets the same segmented active-state treatment as the merchant tabs, so all shells feel like one family.

## 3. Legal & compliance routes

Each is its own file route with unique `head()` metadata and canonical, rendered inside the public shell:

- `/legal/terms` — Allgemeine Geschäftsbedingungen (Nutzungsbedingungen)
- `/legal/privacy` — Datenschutzerklärung (GDPR / DSGVO)
- `/legal/imprint` — Impressum (required in DE)
- `/legal/cookies` — Cookie-Richtlinie with the current category list and a "Cookie-Einstellungen öffnen" button that re-opens the banner
- `/legal/gdpr` — GDPR rights summary + link to submit a data request via `/support/complaints`
- `/legal/complaints` — Beschwerdeformular (name, email, order/membership no., category, message) posting to a `submitComplaint` server function that writes to a new `complaints` table
- `/legal/accessibility` — Erklärung zur Barrierefreiheit
- `/legal/aml` — short AML/KYC notice for the loyalty wallet

All pages are app-owned editable content with the required qualifier line at the top and explicit shared-responsibility wording. No certification claims. No "verified by Lovable" copy.

## 4. Cookie banner + storage

- `CookieConsent` bottom-sheet banner shown once (localStorage key `zoryn.cookie-consent.v1`) with categories: **Notwendig** (locked on), **Analyse**, **Marketing**.
- Accept-all / Reject-all / Save-selection actions. Choices persisted as `{ necessary, analytics, marketing, ts }`.
- Small floating "Cookie-Einstellungen" pill re-opens the modal from any page (also linked from footer + `/legal/cookies`).
- A tiny `useConsent()` hook + `<ConsentGate category="analytics">` wrapper — analytics/marketing scripts (none active yet) will mount only when the user grants that category. Wired now so future GA/Meta pixels drop in without more plumbing.

## 5. Blog with images and social sharing

Data-first, DB-backed so merchants/admin can publish later.

- New `public.blog_posts` table: `id, slug (unique), title, excerpt, body_md, cover_url, author_name, published_at, tags text[]`, RLS: public `SELECT` for `published_at is not null`, admin insert/update/delete.
- Seed 3 posts in the migration (welcome, how points work, merchant success story) with generated hero images.
- Routes:
  - `/blog` — grid with cover, title, excerpt, date, tags
  - `/blog/$slug` — article layout with cover, prose body (rendered from a minimal safe markdown-to-JSX renderer — headings/paragraphs/lists/links only, no `dangerouslySetInnerHTML`), author, publish date, and a **share row** (X, Facebook, LinkedIn, WhatsApp, copy-link) plus `article` schema JSON-LD and per-post `og:image`.
- Loader uses `context.queryClient.ensureQueryData` + `useSuspenseQuery`.

## 6. Stakeholder feature pages

Marketing pages under the public shell, each with its own hero + feature grid + FAQ + CTA:

- `/features/consumers`
- `/features/merchants`
- `/features/staff`
- `/features/enterprise` (chains / franchise)
- `/features/developers` (API roadmap)
- `/features/partners` (affiliate/media)

Reachable from `SiteHeader → Produkt` mega-link and from the footer.

## 7. Technical notes

- **File layout**: `src/routes/(public)/…` isn't necessary; use flat `src/routes/legal.*.tsx`, `src/routes/blog.tsx`, `src/routes/blog.$slug.tsx`, `src/routes/features.*.tsx`. `__root.tsx` conditionally renders `SiteHeader`/`SiteFooter` when `location.pathname` is not under `/app`, `/merchant`, `/admin`, or `/auth`.
- **Server functions**: `blog.functions.ts` (`listPosts`, `getPost`), `complaints.functions.ts` (`submitComplaint`). Public reads are unauthenticated with `TO anon` policies on `blog_posts`.
- **Migration**: adds `blog_posts` + `complaints` tables with grants, RLS, policies; seeds 3 blog posts; adds `admin_list_complaints` RPC for the admin workspace (a new `/admin/complaints` tab).
- **Assets**: 3 blog cover images generated with `imagegen`, uploaded via `lovable-assets` and referenced from the pointer JSONs.
- **Head metadata**: every new route gets unique title/description/og:*; `canonical` on leaves only; blog post routes carry `og:image` pointing at the cover URL.
- **Sitemap/robots**: extend the static `public/sitemap.xml` with the new routes (blog index + legal + features). Individual blog posts stay dynamic — a follow-up phase can generate a live sitemap.
- **A11y**: cookie banner is a focus-trapped dialog; back-to-top button has aria-label + reduced-motion respect.

## 8. Out of scope for this phase

- Real analytics/marketing pixels (only the consent plumbing lands).
- Rich WYSIWYG editor for the blog (posts editable via SQL / future admin form).
- Multi-language — copy is German with English brand terms as today.

Reply "go" to build, or ask for changes to any section.
