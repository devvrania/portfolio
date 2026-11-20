"use client";

import { useEffect, useRef, useState } from "react";

/**
 * One pill for email: the address opens the visitor's mail app, and the copy icon on its right copies it, for
 * browsers with no mail app behind mailto: (common on work laptops). The icon turns into a tick for a moment
 * and the result is announced to screen readers.
 */
export function EmailButton({ email, primary = false }: { email: string; primary?: boolean }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed"); // e.g. clipboard blocked; the address is still readable right next to the icon
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  };

  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <span
      className={
        "group inline-flex items-stretch overflow-hidden rounded-full text-sm font-semibold transition " +
        (primary
          ? "bg-accent text-white shadow-[0_0_24px_rgba(255,59,92,.35)]"
          : "border border-line bg-panel/80 text-ink backdrop-blur hover:border-accent/60")
      }
    >
      <a href={`mailto:${email}`} className={`rounded-l-full py-2.5 pl-5 pr-3 transition hover:text-accent ${primary ? "hover:text-white hover:brightness-110" : ""} ${focus}`}>
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={state === "copied" ? "Email copied" : "Copy email"}
        title={state === "copied" ? "Copied!" : state === "failed" ? "Couldn’t copy" : "Copy email"}
        className={`grid place-items-center rounded-r-full border-l pl-3 pr-4 transition ${primary ? "border-white/30" : "border-line text-muted hover:text-accent"} ${focus}`}
      >
        {state === "copied" ? (
          <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8.5 3 3 7-7" /></svg>
        ) : (
          <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h2" /></svg>
        )}
      </button>
      <span className="sr-only" aria-live="polite">{state === "copied" ? "Email copied" : state === "failed" ? "Couldn’t copy the email" : ""}</span>
    </span>
  );
}
