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
    let running = false;
    let target = 0;
    let cur = 0;
    const computeTarget = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -100 || r.top > vh + 100) return;
      const center = r.top + r.height / 2;
      // p ~ [-1, 1]: positive when the element sits below the viewport centre.
      target = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2 + r.height / 2)));
    };
    // Lerp toward the target so parallax eases instead of snapping 1:1 to scroll.
    const tick = () => {
      cur += (target - cur) * 0.09;
      box.style.transform = `translate3d(0, ${(-cur * strength).toFixed(3)}%, 0)`;
      if (Math.abs(target - cur) > 0.0004) {
        raf = requestAnimationFrame(tick);
      } else {
        cur = target;
        box.style.transform = `translate3d(0, ${(-cur * strength).toFixed(3)}%, 0)`;
        running = false;
      }
    };
    const onScroll = () => {
      computeTarget();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    computeTarget();
    cur = target;
    box.style.transform = `translate3d(0, ${(-cur * strength).toFixed(3)}%, 0)`;
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
