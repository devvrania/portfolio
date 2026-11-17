"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { kairoStatus, loadingLine } from "@/lib/kairo-status";

/** Long enough to read as intentional rather than a flash; short enough not to feel like a wait. */
const MIN_MS = 4000;
/** Matches the exit transition below. */
const EXIT_MS = 700;
const noop = () => () => {};

/**
 * Full-screen loader shown before the portfolio, once per browser session.
 * It's in the server HTML so the page never flashes underneath; an inline script in the layout
 * hides it before first paint on repeat visits (see `splashScript`).
 */
export function Splash() {
  const status = useSyncExternalStore(kairoStatus.subscribe, kairoStatus.get, kairoStatus.getServer);
  const [elapsed, setElapsed] = useState(0);
  const [gone, setGone] = useState(false);
  // Repeat visit this session: the inline script already hid the splash before paint, so skip it entirely
  const seen = useSyncExternalStore(noop, () => document.documentElement.dataset.splash === "seen", () => false);

  useEffect(() => {
    if (seen) return;
    // performance.now() counts from navigation start, so time spent before hydration counts toward the minimum
    const id = setInterval(() => setElapsed(performance.now()), 100);
    return () => clearInterval(id);
  }, [seen]);

  // Wait for Kairo to be fully in (or for his load to fail; see KairoStage), however long the download takes,
  // so the site never opens on an empty hero with him still on his way
  const settled = status.phase !== "loading";
  const leaving = elapsed >= MIN_MS && settled;

  useEffect(() => {
    if (!leaving) return;
    document.documentElement.dataset.splash = "done";
    // Scrolling was locked while the splash was up, so the browser couldn't jump to a linked section
    // (e.g. /#projects); go there now, gliding in as the splash fades.
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView({ behavior: "smooth" });
    try { sessionStorage.setItem("splash-seen", "1"); } catch {}
    const t = setTimeout(() => setGone(true), EXIT_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  if (seen || gone) return null;

  // The bar is two layers in one track, and you see whichever is further along:
  // - a pure-CSS creep that starts at first paint. Kairo's iframe shares this page's main thread and blocks it
  //   for a few seconds while he sets up his model; a CSS transform animation keeps running through that,
  //   where anything driven by JavaScript (including a percentage readout) would freeze.
  // - the real figure: Kairo's download progress, held below 100% until he's at his desk; or, with nothing to
  //   wait for (phones, failed load), an even fill over the minimum time.
  // Either way it's paced by the clock, so a fast load doesn't fill the bar and then sit there until MIN_MS.
  const timePct = Math.min(100, (elapsed / MIN_MS) * 100);
  const pct = Math.min(
    timePct,
    status.phase === "ready" ? 100 : status.phase === "loading" ? Math.min(95, status.progress) : 100,
  );
  // The status line follows the same estimate the CSS creep draws (see .splash-creep in globals.css)
  const shown = Math.max(pct, 90 * (1 - Math.exp(-elapsed / 2500)));

  return (
    <div
      id="splash"
      role="status"
      aria-live="polite"
      aria-label="Loading Rania's portfolio"
      aria-hidden={leaving}
      className={`fixed inset-0 z-50 grid place-items-center bg-bg transition duration-700 ease-out ${leaving ? "pointer-events-none scale-[1.03] opacity-0" : "opacity-100"}`}
    >
      {/* soft crimson glow, like the desk lamp in Kairo's room */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex w-[min(24rem,calc(100%-3rem))] flex-col items-center text-center">
        <div className="relative">
          <span aria-hidden className="absolute -inset-2 animate-[spin_3s_linear_infinite] rounded-full border-2 border-transparent border-t-accent border-r-blossom/60 motion-reduce:animate-none" />
          {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
          <img src="/images/kairo-avatar.jpg" alt="" className="h-32 w-32 rounded-full ring-1 ring-line" />
        </div>

        <p className="mt-9 font-mono text-base font-semibold">
          <span className="text-accent">&lt;</span>devvrania<span className="text-accent">/&gt;</span>
        </p>

        <p className="mt-8 max-w-full truncate font-mono text-sm text-ink/70">
          <span className="text-blossom">kairo</span> ~ <span className="text-ink">{loadingLine(shown)}</span>
          <span className="kairo-caret ml-0.5 inline-block w-[0.55em] text-accent">▍</span>
        </p>

        <div className="relative mt-4 h-1 w-full overflow-hidden rounded-full bg-line">
          {/* the fills are plain white; one gradient laid over the whole track tints them, so two layers stretched
              by different amounts still read as one smooth bar */}
          <div className="splash-creep absolute inset-0 origin-left rounded-full bg-white" />
          <div
            className="absolute inset-0 origin-left rounded-full bg-white transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${pct / 100})` }}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-accent to-blossom mix-blend-multiply" />
        </div>
      </div>
    </div>
  );
}

/** Runs before first paint: skip the splash for the rest of the session once it has been seen. */
export const splashScript = `try{if(sessionStorage.getItem("splash-seen"))document.documentElement.dataset.splash="seen"}catch(e){}`;
