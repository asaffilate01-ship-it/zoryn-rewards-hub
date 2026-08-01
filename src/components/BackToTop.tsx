import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useT } from "@/lib/i18n";

export function BackToTop() {
  const t = useT();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const scrolled = h.scrollTop || document.body.scrollTop;
        const max = h.scrollHeight - h.clientHeight;
        const p = max > 0 ? Math.min(1, scrolled / max) : 0;
        setProgress(p);
        setVisible(scrolled > 400);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const r = 22;
  const c = 2 * Math.PI * r;
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" })}
      aria-label={t("Nach oben")}
      className={`fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-lg backdrop-blur-xl transition-all ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="absolute inset-0"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r={r} className="fill-none stroke-border/40" strokeWidth="2" />
        <circle
          cx="24"
          cy="24"
          r={r}
          className="fill-none stroke-brand"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <ArrowUp className="relative h-4 w-4" />
    </button>
  );
}
