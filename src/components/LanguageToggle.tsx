import { Globe } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "de" ? "en" : "de")}
      aria-label={locale === "de" ? "Switch to English" : "Auf Deutsch umschalten"}
      title={locale === "de" ? "Switch to English" : "Auf Deutsch umschalten"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-card/60 hover:text-foreground",
        className,
      )}
    >
      <Globe className="size-3.5" />
      <span className="uppercase">{locale === "de" ? "EN" : "DE"}</span>
    </button>
  );
}
