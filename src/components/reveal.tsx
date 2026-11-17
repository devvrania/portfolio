"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Calls `onShow` once, the first time `el` scrolls (mostly) into view. */
function useOnceInView<T extends Element>(onShow: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      onShow();
      io.disconnect();
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
    // onShow is a fresh closure each render; observing once on mount is the intent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

/**
 * A card that rises into place when it scrolls into view (staggered by `delay` ms), lifts on hover and has a soft
 * crimson spotlight that follows the cursor. Hidden-before-reveal only applies when scripting is on, so the card is
 * never stuck invisible; reduced motion gets no movement at all (see globals.css).
 */
export function RevealCard({ children, className = "", delay = 0, as: Tag = "div" }: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "aside";
}) {
  const [shown, setShown] = useState(false);
  const [settled, setSettled] = useState(false); // entrance finished: drop the stagger so hover responds instantly
  const ref = useOnceInView<HTMLDivElement>(() => {
    setShown(true);
    setTimeout(() => setSettled(true), delay + 800);
  });

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "shown" : "pending"}
      style={{ transitionDelay: shown && !settled ? `${delay}ms` : undefined }}
      onPointerMove={onPointerMove}
      className={`reveal-card spotlight-card ${className}`}
    >
      {children}
    </Tag>
  );
}

/**
 * A wrapper that flips `data-reveal` from "pending" to "shown" the first time it scrolls into view. The CSS decides
 * what that looks like (the skills section uses it to pop each group's tags in one after another).
 */
export function RevealGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [shown, setShown] = useState(false);
  const ref = useOnceInView<HTMLDivElement>(() => setShown(true));
  return (
    <div ref={ref} data-reveal={shown ? "shown" : "pending"} className={className}>
      {children}
    </div>
  );
}

/**
 * "30%" counts up from 0 when it scrolls into view. The server renders the final value (so search engines, no-JS
 * and screen readers always get the real figure); the moving number is decorative and hidden from screen readers.
 */
export function CountUp({ value, duration = 1200, delay = 0 }: { value: string; duration?: number; delay?: number }) {
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? Number(match[2]) : NaN;
  const [shown, setShown] = useState<string | null>(null); // null = render the final value as-is

  const ref = useOnceInView<HTMLSpanElement>(() => {
    if (!match || reducedMotion()) return setShown(null);
    const [, prefix, , suffix] = match;
    const decimals = match[2].includes(".") ? match[2].split(".")[1].length : 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic: quick start, gentle landing
      setShown(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
      if (t < 1) requestAnimationFrame(step);
    };
    setShown(`${prefix}0${suffix}`);
    setTimeout(() => requestAnimationFrame(step), delay);
  });

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden={shown !== null || undefined}>{shown ?? value}</span>
      {shown !== null && <span className="sr-only">{value}</span>}
    </span>
  );
}
