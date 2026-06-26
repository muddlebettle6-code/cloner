"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { Img } from "@/components/img";
import { FigCaption } from "@/components/figure";
import { ArrowIcon, CloseIcon } from "@/components/icons";
import { APPROACH_CARDS } from "@/lib/site-images";
import { APPROACH, APPROACH_PILLARS } from "@/lib/site-data";
import type { ApproachPillar } from "@/types";

/**
 * Approach — "Different strengths. One accountable process." Three pillar cards
 * (Human / AI / Deterministic) open a slide-over drawer listing contributions.
 */
export function Approach() {
  const [open, setOpen] = useState<ApproachPillar | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section
      id="approach"
      className="w-full scroll-mt-[80px] bg-cream px-[15px] py-[70px] md:px-[30px] md:py-[110px]"
    >
      <Reveal stagger className="grid grid-cols-12 gap-[15px] md:gap-[30px]">
        <div className="col-span-12 md:col-span-5">
          <h2 className="text-[40px] leading-[1.1] tracking-[-0.48px] md:text-[48px]">
            {APPROACH.heading}
          </h2>
        </div>
        <div className="col-span-12 md:col-span-6 md:col-start-7">
          <p className="text-[18px] leading-[1.3] text-ink md:text-[24px]">{APPROACH.subtitle}</p>
        </div>
      </Reveal>

      <Reveal stagger className="mt-[40px] grid grid-cols-1 gap-[8px] md:grid-cols-3">
        {APPROACH_PILLARS.map((pillar, i) => (
          <div key={pillar.key}>
            <button
              onClick={() => setOpen(pillar)}
              className="group relative block aspect-square w-full overflow-hidden text-left"
            >
              <Img
                src={APPROACH_CARDS[i].src}
                alt={pillar.title}
                className="absolute inset-0 h-full w-full"
                imgClassName="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
              <div className="absolute inset-x-0 bottom-0 p-[20px] md:p-[24px]">
                <h3 className="text-[28px] leading-[1.1] tracking-[-0.36px] text-white md:text-[36px]">
                  {pillar.title}
                </h3>
                <span className="mt-[10px] inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.04em] text-white">
                  See contributions <ArrowIcon className="h-[14px] w-[14px]" />
                </span>
              </div>
            </button>
            <FigCaption info={APPROACH_CARDS[i].caption} relation={APPROACH_CARDS[i].relation} />
          </div>
        ))}
      </Reveal>

      <div
        onClick={() => setOpen(null)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[70] bg-black/40 transition-opacity duration-300 ease-[var(--ease-standard)]",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="approach-drawer-title"
        aria-hidden={!open}
        className={cn(
          "fixed right-0 top-0 z-[71] h-full w-full overflow-y-auto bg-cream p-[20px] transition-transform duration-[var(--dur-drawer)] ease-[var(--ease-drawer)] md:w-[58%] md:p-[40px]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink">{open?.title}</span>
          <button
            onClick={() => setOpen(null)}
            className="inline-flex items-center gap-[8px] font-mono text-[11px] uppercase text-ink transition-opacity duration-300 hover:opacity-60"
          >
            CLOSE <CloseIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
        <h3 id="approach-drawer-title" className="mt-[40px] text-[28px] leading-[1.15] tracking-[-0.3px] text-ink md:text-[36px]">
          {open?.title}
        </h3>
        <p className="mt-[16px] text-[16px] leading-[1.45] text-ink">{open?.summary}</p>
        <h4 className="mt-[32px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">Contributes</h4>
        <div className="mt-[10px]">
          {open?.contributions.map((c) => (
            <p key={c} className="border-t border-clay py-[10px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink">
              {c}
            </p>
          ))}
        </div>
      </aside>
    </section>
  );
}
