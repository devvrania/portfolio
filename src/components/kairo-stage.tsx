"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { kairoStatus } from "@/lib/kairo-status";

const WIDE = "(min-width: 768px)";
/** The splash waits for Kairo however long he takes, so a download that stops without erroring would hold it forever. */
const STALL_MS = 30000;

/** Big screens always get the live scene (and the splash waits for it); phones keep the banner art. */
function subscribe(onChange: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function wantsLive() {
  return window.matchMedia(WIDE).matches;
}

/**
 * Kairo's desk, live: the scene from the `kairo` repo (synced into /public/kairo) in a same-origin iframe.
 * The banner art sits underneath until he's in, then the live scene fades in over it.
 * Loading progress goes to `kairoStatus`, which the splash screen shows.
 *
 * Phones get the banner by default, with a "Meet Kairo in 3D" button that loads him on request,
 * so nobody downloads the 20 MB model without choosing to.
 */
export function KairoStage() {
  const auto = useSyncExternalStore(subscribe, wantsLive, () => false);
  const [optIn, setOptIn] = useState(false);
  const live = auto || optIn;
  const { phase, progress } = useSyncExternalStore(kairoStatus.subscribe, kairoStatus.get, kairoStatus.getServer);
  const frame = useRef<HTMLIFrameElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!live) kairoStatus.set({ phase: "off" });
    else if (kairoStatus.get().phase === "off") kairoStatus.set({ phase: "loading", progress: 0 });
  }, [live]);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Give up on Kairo (keep the banner, let the splash go) if his progress hasn't moved for STALL_MS.
  // Slow is fine; only no progress at all counts. Errors are reported faster, through #status (see watch).
  useEffect(() => {
    if (!live) return;
    let last = -1, since = Date.now();
    const id = setInterval(() => {
      const { phase, progress } = kairoStatus.get();
      if (phase !== "loading") return clearInterval(id);
      if (progress !== last) { last = progress; since = Date.now(); }
      else if (Date.now() - since > STALL_MS) { kairoStatus.set({ phase: "failed" }); clearInterval(id); }
    }, 1000);
    return () => clearInterval(id);
  }, [live]);

  // Kairo writes "Loading Kairo… 42%" into #status while the model downloads and removes it once he's in.
  // The iframe is same-origin, so read that rather than guessing.
  function watch() {
    // Kairo's own "Click Kairo to say hi" line sits at the bottom of his scene, which the hero text covers;
    // the About section gives the same tip, so hide it here
    const hide = frame.current?.contentDocument?.createElement("style");
    if (hide) {
      // on a phone the scene is wider than the screen, so keep his speech bubble narrow enough to stay in view
      hide.textContent = ".hint{display:none}" + (auto ? "" : ".bubble{max-width:170px}");
      frame.current?.contentDocument?.head.append(hide);
    }
    const poll = () => {
      if (kairoStatus.get().phase !== "loading") return; // already settled, e.g. given up as stalled
      const doc = frame.current?.contentDocument;
      const status = doc?.getElementById("status");
      if (doc?.readyState === "complete" && !status) {
        kairoStatus.set({ phase: "ready", progress: 100 });
        return;
      }
      const text = status?.textContent ?? "";
      if (text.startsWith("Could not load")) {
        kairoStatus.set({ phase: "failed" }); // keep the banner; it's a fine hero on its own
        return;
      }
      const pct = Number(text.match(/(\d+)%/)?.[1]);
      if (pct > kairoStatus.get().progress) kairoStatus.set({ progress: pct });
      timer.current = setTimeout(poll, 150);
    };
    poll();
  }

  return (
    <div className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- static banner art, already sized */}
      <img
        src="/images/kairo-banner.jpg"
        alt="Kairo, Rania's coding companion, at his desk in a night room with a cherry tree outside the window"
        className="absolute inset-0 h-full w-full object-cover object-[32%_center]"
      />

      {/* banner-only visitors (phones): offer the live scene */}
      {!auto && !optIn && phase !== "failed" && (
        <button
          type="button"
          onClick={() => setOptIn(true)}
          className="absolute right-4 top-20 z-10 inline-flex items-center gap-2 rounded-full border border-line bg-bg/75 px-4 py-2 text-sm font-semibold text-ink shadow-lg backdrop-blur-md transition hover:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span aria-hidden className="text-accent">✦</span>
          Meet Kairo in 3D
          <span className="font-mono text-[11px] font-normal text-muted">20 MB</span>
        </button>
      )}

      {/* ...and once they tap it, a loader in the hero, styled like the splash (the splash is long gone by then).
          It covers only the scene (no z-index), so her name and the buttons stay sharp on top.
          The bar has the same two layers as the splash: a CSS creep that keeps moving while Kairo's setup holds
          the main thread, and the real download progress. */}
      {optIn && !auto && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading Kairo in 3D"
          aria-hidden={phase !== "loading"}
          className={`pointer-events-none absolute inset-0 flex justify-center bg-bg/70 pt-28 backdrop-blur-sm transition-opacity duration-700 ${phase === "loading" ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex w-[min(18rem,calc(100%-3rem))] flex-col items-center text-center">
            <div className="relative">
              <span aria-hidden className="absolute -inset-1.5 animate-[spin_3s_linear_infinite] rounded-full border-2 border-transparent border-t-accent border-r-blossom/60 motion-reduce:animate-none" />
              {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
              <img src="/images/kairo-avatar.jpg" alt="" className="h-20 w-20 rounded-full ring-1 ring-line" />
            </div>
            <p className="mt-6 max-w-full truncate font-mono text-sm text-ink/70">
              <span className="text-blossom">kairo</span> ~ <span className="text-ink">{progress < 100 ? "on his way to the desk" : "almost at his desk"}</span>
              <span className="kairo-caret ml-0.5 inline-block w-[0.55em] text-accent">▍</span>
            </p>
            <div className="relative mt-4 h-1 w-full overflow-hidden rounded-full bg-line">
              <div className="splash-creep absolute inset-0 origin-left rounded-full bg-white" />
              <div
                className="absolute inset-0 origin-left rounded-full bg-white transition-transform duration-300 ease-out"
                style={{ transform: `scaleX(${Math.min(95, progress) / 100})` }}
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-accent to-blossom mix-blend-multiply" />
            </div>
            <p className="mt-2 font-mono text-[11px] text-muted">loading the 3D scene · 20 MB</p>
          </div>
        </div>
      )}

      {live && phase !== "failed" && (
        <iframe
          ref={frame}
          src="/kairo/index.html"
          title="Kairo, Rania's 3D coding companion. Move your cursor and he follows it; click him to say hi."
          onLoad={watch}
          // On a phone the scene is still rendered landscape (it's framed for that) and cropped around Kairo,
          // the way the banner is, instead of squeezing the room into a tall narrow frame.
          style={auto ? undefined : { width: "auto", aspectRatio: "1.6", left: "50%", transform: "translateX(-41%)" }}
          className={`absolute top-0 h-full border-0 transition-opacity duration-1000 ${auto ? "left-0 w-full" : ""} ${phase === "ready" ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
