import type { Metadata } from "next";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui";
import { LostPath } from "@/components/lost-path";

export const metadata: Metadata = {
  title: `Page not found · ${site.name}`,
};

/** Cherry petals drifting down, like the tree outside Kairo's window. Fixed positions so the page renders the same everywhere. */
const PETALS = [
  { left: "6%", delay: "0s", duration: "11s", size: 10 },
  { left: "17%", delay: "4s", duration: "13s", size: 7 },
  { left: "29%", delay: "1.5s", duration: "10s", size: 9 },
  { left: "41%", delay: "6s", duration: "14s", size: 6 },
  { left: "55%", delay: "2.5s", duration: "12s", size: 11 },
  { left: "66%", delay: "7.5s", duration: "11s", size: 8 },
  { left: "78%", delay: "0.8s", duration: "13s", size: 10 },
  { left: "90%", delay: "5s", duration: "10s", size: 7 },
];

export default function NotFound() {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-6 py-16">
      {/* lamp glow + falling petals */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {PETALS.map(p => (
          <span
            key={p.left}
            className="petal absolute -top-6 rounded-[80%_0_80%_0] bg-blossom/70"
            style={{ left: p.left, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.duration }}
          />
        ))}
      </div>

      {/* a plain link (full page load), like the buttons below, so the home page opens with its splash as normal */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="absolute left-6 top-5 font-mono text-sm font-semibold md:left-10">
        <span className="text-accent">&lt;</span>{site.handle}<span className="text-accent">/&gt;</span>
      </a>

      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        {/* Kairo, bobbing, with a puzzled speech bubble */}
        <div className="relative">
          <div className="kairo-bob">
            {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
            <img src="/images/kairo-avatar.jpg" alt="Kairo, looking puzzled" className="h-28 w-28 rounded-full ring-2 ring-accent/50" />
          </div>
          <span className="absolute -right-12 -top-3 rotate-6 rounded-2xl rounded-bl-sm border border-line bg-panel px-3 py-1.5 font-mono text-sm text-blossom shadow-lg">
            huh?
          </span>
        </div>

        <p className="mt-8 bg-gradient-to-r from-accent to-blossom bg-clip-text text-7xl font-semibold tracking-tight text-transparent md:text-8xl">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Kairo looked everywhere…</h1>
        <p className="mt-3 leading-relaxed text-muted">
          …but this page isn&apos;t in Rania&apos;s codebase. Maybe it got refactored away, or the link has a typo.
        </p>

        {/* a tiny terminal session, in on the joke */}
        <div className="mt-8 w-full rounded-2xl border border-line bg-panel/80 p-5 text-left font-mono text-xs leading-6 backdrop-blur md:text-sm">
          <div className="mb-3 flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-blossom/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
          </div>
          <p className="truncate">
            <span className="text-blossom">kairo</span> <span className="text-muted">~</span> open <span className="text-ink"><LostPath /></span>
          </p>
          <p className="text-accent">error: page not found (404)</p>
          <p className="text-muted">hint: the good stuff is on the home page ✦</p>
          <p>
            <span className="text-blossom">kairo</span> <span className="text-muted">~</span>
            <span className="kairo-caret ml-1.5 inline-block w-[0.55em] text-accent">▍</span>
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" primary>Take me home</ButtonLink>
          <ButtonLink href="/#projects">See my work</ButtonLink>
        </div>
      </div>
    </main>
  );
}
