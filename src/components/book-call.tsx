"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";

/**
 * "Book a call": opens the Cal.com booking calendar in a popup over the page, so a visitor never leaves the site.
 *
 * Cal's embed script is fetched only once someone shows intent (hovers, focuses or taps the button), so it costs the
 * page nothing up front. It's a real link to the booking page underneath: without JavaScript, or when the script is
 * blocked (ad-blockers often block it), the click simply opens the booking page in a new tab.
 */

const EMBED_JS = "https://app.cal.com/embed/embed.js";
const NAMESPACE = "intro";

type CalApi = (instruction: string, ...args: unknown[]) => void;
type CalGlobal = CalApi & { loaded?: boolean; ns: Record<string, CalApi>; q?: unknown[] };
declare global {
  interface Window { Cal?: CalGlobal }
}

let loading: Promise<CalApi> | null = null;

/** Cal's official loader snippet (it queues calls until embed.js arrives), resolved once the script has loaded. */
function loadCal(origin: string): Promise<CalApi> {
  if (loading) return loading;
  loading = new Promise<CalApi>((resolve, reject) => {
    /* eslint-disable */
    // @ts-expect-error: Cal's snippet, kept as published
    (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, EMBED_JS, "init");
    /* eslint-enable */
    const cal = window.Cal!;
    cal("init", NAMESPACE, { origin });
    const api = cal.ns[NAMESPACE];
    // Match the site: dark, with the crimson accent.
    api("ui", { theme: "dark", cssVarsPerTheme: { dark: { "cal-brand": "#ff3b5c" } }, hideEventTypeDetails: false, layout: "month_view" });

    const script = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_JS}"]`);
    if (!script) return reject(new Error("Cal embed script missing"));
    script.addEventListener("load", () => resolve(api), { once: true });
    script.addEventListener("error", () => reject(new Error("Cal embed script blocked")), { once: true });
  }).catch((error) => {
    loading = null; // a later click can try again (or fall back to the link)
    throw error;
  });
  return loading;
}

export function BookCall({ url, children, primary = false }: { url: string; children: ReactNode; primary?: boolean }) {
  const [blocked, setBlocked] = useState(false);
  const blockedRef = useRef(false);
  const { origin, calLink } = parse(url);

  const prefetch = () => {
    if (blockedRef.current) return;
    loadCal(origin).catch(() => { blockedRef.current = true; setBlocked(true); });
  };

  const open = async (event: MouseEvent<HTMLAnchorElement>) => {
    // Modifier clicks (new tab/window) and a blocked script keep the plain link behaviour.
    if (blockedRef.current || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    try {
      const cal = await loadCal(origin);
      cal("modal", { calLink, config: { layout: "month_view", theme: "dark" } });
    } catch {
      blockedRef.current = true;
      setBlocked(true);
      // We're past the click by now, so a new tab may be blocked: fall back to this tab.
      if (!window.open(url, "_blank", "noopener")) window.location.assign(url);
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onPointerEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      onClick={open}
      data-cal-fallback={blocked || undefined}
      className={
        "group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
        (primary
          ? "bg-accent text-white shadow-[0_0_24px_rgba(255,59,92,.35)] hover:brightness-110"
          : "border border-line bg-panel/80 text-ink backdrop-blur hover:border-accent/60")
      }
    >
      <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
      </svg>
      {children}
    </a>
  );
}

/** "https://cal.com/devvrania/intro-call" → origin "https://cal.com" and calLink "devvrania/intro-call". */
function parse(url: string) {
  const { hostname, pathname } = new URL(url);
  const calLink = pathname.replace(/^\/+|\/+$/g, "");
  return { origin: `https://${hostname}`, calLink };
}
