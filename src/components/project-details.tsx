"use client";

import { useRef, type ReactNode } from "react";

/**
 * "Details" for a project card: a button that opens the full write-up in a modal panel, so the card grid never
 * changes shape. Uses the native <dialog>: Esc closes it and focus is trapped inside while open; clicking the dimmed
 * backdrop or ✕ closes it too. The content is rendered on the server and passed in as children.
 */
export function ProjectDetails({ title, children }: { title: string; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="flex w-fit items-center gap-1.5 rounded-full font-mono text-xs text-ink/80 transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Details
        <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l4 4-4 4" /></svg>
        <span className="sr-only"> about {title}</span>
      </button>

      <dialog
        ref={dialog}
        aria-label={title}
        // a click that lands on the <dialog> itself (not its content) is a click on the backdrop
        onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}
        className="project-dialog m-auto w-[min(44rem,calc(100%-2rem))] max-h-[min(88svh,52rem)] overflow-hidden rounded-2xl border border-line bg-panel p-0 text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] backdrop:bg-bg/75 backdrop:backdrop-blur-sm"
      >
        {/* ✕ pinned to the panel's corner (over the preview's browser bar), outside the scrolling area so it stays put */}
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label="Close"
          className="absolute right-2.5 top-1.5 z-10 grid h-7 w-7 place-items-center rounded-full border border-line bg-bg/80 text-muted backdrop-blur transition hover:border-accent/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>
        <div className="max-h-[min(88svh,52rem)] overflow-y-auto">{children}</div>
      </dialog>
    </>
  );
}
