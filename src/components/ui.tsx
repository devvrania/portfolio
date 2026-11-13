import type { ReactNode } from "react";

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

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-panel-2 px-3 py-1 font-mono text-xs text-muted">{children}</span>
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

export function ButtonLink({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={
        primary
          ? "pointer-events-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(255,59,92,.35)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          : "pointer-events-auto inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-5 py-2.5 text-sm font-semibold text-ink backdrop-blur transition hover:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      }
    >
      {children}
    </a>
  );
}
