"use client";

import { useEffect, useState } from "react";

const WORDS = ["Software", "Full-Stack", "Backend", "AI"];
const EVERY_MS = 2800;

/**
 * The outlined word over "ENGINEER" in the hero: it rolls through what kind of engineer she is.
 * Every word sits in the same grid cell, so the block keeps the width of the longest and nothing jumps;
 * the current word slides up into place and the previous one slides on up and out.
 * With reduced motion it stays on the first word.
 */
export function RoleCycler({ className = "" }: { className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI(n => (n + 1) % WORDS.length), EVERY_MS);
    return () => clearInterval(id);
  }, []);

  const prev = (i - 1 + WORDS.length) % WORDS.length;

  return (
    <span aria-hidden className={`grid justify-items-start md:justify-items-end ${className}`}>
      {WORDS.map((w, n) => (
        <span
          key={w}
          className={`col-start-1 row-start-1 transition-[opacity,transform,filter] duration-700 ease-out ${
            n === i ? "translate-y-0 opacity-100 blur-0"
            : n === prev ? "-translate-y-1/3 opacity-0 blur-sm"
            : "translate-y-1/3 opacity-0 blur-sm"
          }`}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
