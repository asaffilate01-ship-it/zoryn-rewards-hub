import { meta as metaEn } from "@/lib/i18n/dict/meta";
import type { Locale } from "@/lib/i18n";

const reverse: Record<string, string> = Object.fromEntries(
  Object.entries(metaEn).map(([de, en]) => [en, de]),
);

type Override = { title?: string; description?: string } | null;

let override: Override = null;
const listeners = new Set<() => void>();

/** Route-level override for head tags whose text comes from the database. */
export function setHeadOverride(next: Override) {
  override = next;
  listeners.forEach((l) => l());
}

export function onHeadOverrideChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function convert(value: string | null, locale: Locale) {
  if (!value) return null;
  return (locale === "en" ? metaEn[value] : reverse[value]) ?? null;
}

function setMeta(selector: string, value: string) {
  document.querySelectorAll<HTMLMetaElement>(selector).forEach((el) => {
    if (el.getAttribute("content") !== value) el.setAttribute("content", value);
  });
}

const DESCRIPTION_SELECTORS =
  'meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]';
const TITLE_SELECTORS = 'meta[property="og:title"], meta[name="twitter:title"]';

/** Translate the rendered head tags to the active locale. */
export function applyHeadLocale(locale: Locale) {
  if (typeof document === "undefined") return;

  if (override) {
    if (override.title) {
      document.title = override.title;
      setMeta(TITLE_SELECTORS, override.title);
    }
    if (override.description) setMeta(DESCRIPTION_SELECTORS, override.description);
    return;
  }

  const nextTitle = convert(document.title, locale);
  if (nextTitle) document.title = nextTitle;

  for (const selector of [DESCRIPTION_SELECTORS, TITLE_SELECTORS]) {
    document.querySelectorAll<HTMLMetaElement>(selector).forEach((el) => {
      const next = convert(el.getAttribute("content"), locale);
      if (next) el.setAttribute("content", next);
    });
  }
}
