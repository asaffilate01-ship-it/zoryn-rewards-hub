import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { applyHeadLocale, onHeadOverrideChange } from "@/lib/head-locale";
import { useLocale } from "@/lib/i18n";

/**
 * Head tags render server-side in German (the primary market).
 * After hydration we keep the title/description tags in sync with the
 * reader's chosen locale, re-applying whenever the router rewrites the head.
 */
export function HeadLocalizer() {
  const { locale } = useLocale();
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const apply = () => applyHeadLocale(locale);

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    const unsubscribe = onHeadOverrideChange(apply);

    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [locale, href]);

  return null;
}
