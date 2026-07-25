import markAsset from "@/assets/zoryn-mark.png.asset.json";

interface ZorynMarkProps {
  size?: number;
  className?: string;
}

export function ZorynMark({ size = 40, className }: ZorynMarkProps) {
  return (
    <img
      src={markAsset.url}
      alt="Zoryn"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
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
