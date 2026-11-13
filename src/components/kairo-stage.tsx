"use client";

import { useRef, useState, useSyncExternalStore } from "react";

const WIDE = "(min-width: 768px)";

/** Big screens on a normal connection get the live scene; phones and data-saver keep the banner art. */
function subscribe(onChange: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function wantsLive() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return window.matchMedia(WIDE).matches && !saveData;
}

/**
 * Kairo's desk, live: the scene from the `kairo` repo (synced into /public/kairo) in a same-origin iframe.
 * The banner art shows underneath until he has loaded, then the live scene fades in over it.
 */
export function KairoStage() {
  const live = useSyncExternalStore(subscribe, wantsLive, () => false);
  const [ready, setReady] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  // Kairo removes his "Loading Kairo…" line once the model is in; wait for that, not just the page load
  function watchUntilReady() {
    const poll = () => {
      const doc = frame.current?.contentDocument;
      if (doc && doc.readyState === "complete" && !doc.getElementById("status")) setReady(true);
      else setTimeout(poll, 200);
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
      {live && (
        <iframe
          ref={frame}
          src="/kairo/index.html"
          title="Kairo, Rania's 3D coding companion. Move your cursor and he follows it; click him to say hi."
          onLoad={watchUntilReady}
          className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
