"use client";

import { useEffect, useRef } from "react";

/**
 * A short muted clip that loops like a GIF (sharper and far smaller than one).
 * Plays only while on screen, and not at all for visitors who prefer reduced motion: they get the poster frame.
 */
export function LoopVideo({ src, poster, className = "" }: { src: string; poster: string; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) v.play().catch(() => {}); // autoplay can be refused; the poster stays up then
      else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={video}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={className}
    />
  );
}
