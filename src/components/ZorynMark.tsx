interface ZorynMarkProps {
  size?: number;
  className?: string;
}

export function ZorynMark({ size = 40, className }: ZorynMarkProps) {
  return (
    <span
      className={className}
      style={{ width: size, height: size, display: "inline-flex" }}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label="Zoryn">
        <defs>
          <linearGradient id="zoryn-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.24 300)" />
            <stop offset="55%" stopColor="oklch(0.62 0.22 268)" />
            <stop offset="100%" stopColor="oklch(0.78 0.14 220)" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#zoryn-g)" />
        <path
          d="M20 20 H44 L23 44 H44"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ZorynWordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <ZorynMark size={32} />
      <span className="font-display text-xl font-semibold tracking-tight">Zoryn</span>
    </span>
  );
}
