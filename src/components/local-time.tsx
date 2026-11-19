"use client";

import { useSyncExternalStore } from "react";

/**
 * Contact: my live local time, how it compares to the visitor's, and whether I'm likely at my desk right now,
 * so a client abroad knows when to expect a reply. Renders a placeholder until mounted (time is client-only).
 */
export function LocalTime({ timeZone, place }: { timeZone: string; place: string }) {
  const minute = useSyncExternalStore(subscribeToClock, currentMinute, () => null);
  const now = minute === null ? null : new Date(minute);

  const time = now ? new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(now) : "--:--";
  const hour = now ? Number(new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(now)) : null;
  const weekday = now ? new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(now) : null;
  // My usual week (Pakistan time): weekends off; on weekdays at my desk 3pm–midnight, around 2–3pm and midnight–2am.
  const status =
    hour === null ? null
    : weekday === "Sat" || weekday === "Sun" ? { text: "Weekend, I’ll reply on Monday", tone: "bg-muted" }
    : hour >= 15 ? { text: "Probably at my desk", tone: "bg-emerald-400" }
    : hour === 14 || hour < 2 ? { text: "Still checking messages", tone: "bg-amber-300" }
    : { text: "Asleep, I’ll reply later today", tone: "bg-muted" };

  return (
    <div className="local-time w-full rounded-xl max-md:order-last border border-line bg-bg/60 p-5 font-mono text-xs text-muted backdrop-blur md:w-72">
      <p className="flex items-center justify-between uppercase tracking-widest">
        <span>Local time</span>
        <span className="text-accent">{place}</span>
      </p>
      <p className="mt-3 font-sans text-4xl font-semibold tabular-nums tracking-tight text-ink" suppressHydrationWarning>
        {time}
      </p>
      <p className="mt-1 min-h-4">{now ? compare(timeZone, now) : ""}</p>
      <p className="mt-4 flex min-h-4 items-center gap-2 border-t border-line pt-4 text-ink/80">
        {status && (
          <>
            <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.tone}`} />
            {status.text}
          </>
        )}
      </p>
    </div>
  );
}

/** A clock ticking every 15s; the snapshot is the current minute, so it only re-renders when the minute changes. */
function subscribeToClock(onTick: () => void) {
  const id = setInterval(onTick, 15_000);
  return () => clearInterval(id);
}
const currentMinute = () => Math.floor(Date.now() / 60_000) * 60_000;

/** "3h ahead of you", "30 min behind you", or "Same time as you". */
function compare(timeZone: string, now: Date): string {
  const visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (visitorZone === timeZone) return "Same timezone as you";
  const diff = offsetMinutes(timeZone, now) - offsetMinutes(visitorZone, now);
  if (diff === 0) return "Same time as you";
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const amount = h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m} min`;
  return `${amount} ${diff > 0 ? "ahead of" : "behind"} you`;
}

/** Minutes a time zone is ahead of UTC at a given moment. */
function offsetMinutes(timeZone: string, at: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })
      .formatToParts(at)
      .map((p) => [p.type, Number(p.value)]),
  );
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return Math.round((asUtc - Math.floor(at.getTime() / 60_000) * 60_000) / 60_000);
}
