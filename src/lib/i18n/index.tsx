import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "./dict";

export type Locale = "de" | "en";

const STORAGE_KEY = "zoryn.locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (de: string) => string;
};

const LocaleContext = createContext<Ctx>({
  locale: "de",
  setLocale: () => {},
  t: (de) => de,
});

function readStored(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "de" || v === "en" ? v : null;
  } catch {
    return null;
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("de");

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setLocaleState(stored);
      return;
    }
    const nav = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "de";
    if (!nav.startsWith("de")) setLocaleState("en");
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (de: string) => {
      if (locale === "de") return de;
      return en[de] ?? de;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** Translate a German source string to the active locale. */
export function useT() {
  return useContext(LocaleContext).t;
}
