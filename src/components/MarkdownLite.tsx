import type { ReactNode } from "react";

/**
 * Minimal markdown renderer — headings, paragraphs, lists, bold, italic,
 * inline code, and links. No HTML pass-through, no dangerouslySetInnerHTML.
 */
export function MarkdownLite({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/);
  return <div className="space-y-4">{blocks.map((block, i) => renderBlock(block, i))}</div>;
}

function renderBlock(block: string, key: number): ReactNode {
  const trimmed = block.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("### "))
    return (
      <h3 key={key} className="mt-6 text-lg font-semibold">
        {inline(trimmed.slice(4))}
      </h3>
    );
  if (trimmed.startsWith("## "))
    return (
      <h2 key={key} className="mt-8 font-display text-2xl font-semibold">
        {inline(trimmed.slice(3))}
      </h2>
    );
  if (trimmed.startsWith("# "))
    return (
      <h1 key={key} className="font-display text-3xl font-semibold">
        {inline(trimmed.slice(2))}
      </h1>
    );
  if (trimmed.startsWith("> "))
    return (
      <blockquote key={key} className="border-l-2 border-brand pl-4 italic text-muted-foreground">
        {inline(trimmed.slice(2))}
      </blockquote>
    );
  if (/^[-*] /.test(trimmed)) {
    const items = trimmed.split(/\n/).map((l) => l.replace(/^[-*] /, ""));
    return (
      <ul key={key} className="list-disc space-y-1 pl-5 text-muted-foreground">
        {items.map((it, j) => (
          <li key={j}>{inline(it)}</li>
        ))}
      </ul>
    );
  }
  return (
    <p key={key} className="text-muted-foreground">
      {inline(trimmed)}
    </p>
  );
}

function inline(text: string): ReactNode {
  // links [text](url)
  const parts: ReactNode[] = [];
  const rx = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1])
      parts.push(
        <a key={i++} href={m[2]} className="text-brand underline underline-offset-2">
          {m[1]}
        </a>,
      );
    else if (m[3])
      parts.push(
        <strong key={i++} className="text-foreground">
          {m[3]}
        </strong>,
      );
    else if (m[4]) parts.push(<em key={i++}>{m[4]}</em>);
    else if (m[5])
      parts.push(
        <code key={i++} className="rounded bg-card px-1 text-xs">
          {m[5]}
        </code>,
      );
    last = rx.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
