import type { CSSProperties, ReactNode } from "react";

export function Section({ id, index, title, children }: { id: string; index: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl px-6 py-14 md:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {index} <span className="text-muted">· {id}</span>
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}

export function Chip({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span style={style} className={`rounded-full border border-line bg-panel-2 px-3 py-1 font-mono text-xs text-muted ${className}`}>{children}</span>
  );
}

/** Marks placeholder content. Only ever rendered in development (drafts are filtered out of production builds). */
export function DraftBadge() {
  return (
    <span className="rounded-full border border-dashed border-blossom/60 px-2.5 py-0.5 font-mono text-[11px] text-blossom">
      draft · fill in src/content/site.ts
    </span>
  );
}

/** A small stroked arrow, drawn rather than typed so ↓ and ↗ share one weight (Geist has no ↗ glyph). */
function Arrow({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={`h-3.5 w-3.5 shrink-0 transition duration-200 motion-reduce:transition-none ${className}`}>
      <path d={d} />
    </svg>
  );
}

/**
 * Pill button for a link. The arrow says where it goes before you click:
 * ↓ moves down this page (an `#anchor`), ↗ opens another site in a new tab. Other links (mailto, files) get none.
 * On hover the arrow nudges in its direction.
 */
export function ButtonLink({ href, children, primary = false, className = "" }: { href: string; children: ReactNode; primary?: boolean; className?: string }) {
  const external = href.startsWith("http");
  const onPage = href.startsWith("#");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={
        "group pointer-events-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
        (primary
          ? "shine relative overflow-hidden bg-accent text-white shadow-[0_0_24px_rgba(255,59,92,.35)] hover:brightness-110"
          : "border border-line bg-panel/80 text-ink backdrop-blur hover:border-accent/60") +
        (className ? ` ${className}` : "")
      }
    >
      {children}
      {onPage && (
        <Arrow d="M8 3v10M3.5 8.5 8 13l4.5-4.5" className="group-hover:translate-y-0.5" />
      )}
      {external && (
        <>
          <Arrow d="M4 12 12 4M5.5 4H12v6.5" className={`group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${primary ? "" : "text-muted group-hover:text-accent"}`} />
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </a>
  );
}
