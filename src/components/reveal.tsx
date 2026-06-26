"use client";

import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "li" | "article";
  delay?: number; // ms
  once?: boolean;
  /** Cascade direct children in sequence instead of revealing as one block. */
  stagger?: boolean;
  /** Per-child delay in ms (default 90). */
  staggerStep?: number;
}

/**
 * Scroll-reveal wrapper: fades + translates up when it enters the viewport.
 * With `stagger`, each direct child cascades in sequence (via a --i CSS var).
 */
export function Reveal({
  as = "div",
  delay = 0,
  once = true,
  stagger = false,
  staggerStep,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) obs.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const Tag = as as React.ElementType;

  const content = stagger
    ? Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        const el = child as React.ReactElement<{ style?: React.CSSProperties }>;
        const mergedStyle: React.CSSProperties = { ...el.props.style };
        (mergedStyle as Record<string, string | number>)["--i"] = i;
        return cloneElement(el, { style: mergedStyle });
      })
    : children;

  const tagStyle: React.CSSProperties = { ...style };
  if (delay) tagStyle.transitionDelay = `${delay}ms`;
  if (staggerStep) (tagStyle as Record<string, string | number>)["--stagger-step"] = `${staggerStep}ms`;

  return (
    <Tag
      ref={ref}
      data-stagger={stagger ? "" : undefined}
      className={cn("reveal", visible && "is-visible", className)}
      style={tagStyle}
      {...rest}
    >
      {content}
    </Tag>
  );
}
