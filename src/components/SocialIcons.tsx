import { Facebook, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19.5 6.7a5.6 5.6 0 0 1-3.3-1.1 5.6 5.6 0 0 1-2.2-4.1h-3.3v13.1a2.7 2.7 0 1 1-2-2.6V8.7a6 6 0 1 0 5.3 6V9.2a8.9 8.9 0 0 0 5.5 1.9V7.8c-.1 0-.1 0 0-1.1Z" />
    </svg>
  );
}

export interface SocialLink {
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com/zoryn", Icon: Instagram },
  { label: "TikTok", href: "https://tiktok.com/@zoryn", Icon: TikTokIcon },
  { label: "X", href: "https://x.com/zoryn", Icon: Twitter },
  { label: "Facebook", href: "https://facebook.com/zoryn", Icon: Facebook },
  { label: "YouTube", href: "https://youtube.com/@zoryn", Icon: Youtube },
  { label: "LinkedIn", href: "https://linkedin.com/company/zoryn", Icon: Linkedin },
];

export function SocialRow({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {socialLinks.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-card/40 text-muted-foreground transition hover:border-brand/60 hover:text-brand"
          >
            <Icon className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}
