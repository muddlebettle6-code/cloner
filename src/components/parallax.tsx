"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Vertical scroll parallax. The container clips; the inner layer is taller than
 * the container and translates as it passes through the viewport — matching Seed
 * Health's full-bleed media-band parallax. `strength` is the max translate in %
 * of the inner layer height.
 */
export function Parallax({
  children,
  className,
  strength = 8,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const box = inner.current;
    if (!el || !box) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let ticking = false;
    // Bind transform DIRECTLY to scroll position (no lerp). The old easing chased
    // the scroll a frame behind, which read as floaty/glitchy; 1:1 tracking is
    // crisp and smooth on both mobile and desktop.
    const apply = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -120 || r.top > vh + 120) return;
      const center = r.top + r.height / 2;
      const p = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2 + r.height / 2)));
      box.style.transform = `translate3d(0, ${(-p * strength).toFixed(3)}%, 0)`;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} data-parallax className={cn("relative overflow-hidden", className)}>
      <div ref={inner} className="absolute inset-x-0 -top-[15%] h-[130%] will-change-transform">
        {children}
      </div>
    </div>
  );
}
