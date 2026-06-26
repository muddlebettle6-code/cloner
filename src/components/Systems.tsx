"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { Img } from "@/components/img";
import { FigCaption } from "@/components/figure";
import { ArrowIcon, CloseIcon } from "@/components/icons";
import { SYSTEMS_CARDS } from "@/lib/site-images";
import { SYSTEMS_INTRO, SYSTEM_CATEGORIES, systemsInCategory } from "@/lib/site-data";

/**
 * Systems — "A research system built to challenge itself." Three category cards
 * (AI agents / Deterministic infrastructure / Human governance) open a drawer
 * listing each member system. Card + drawer composition preserved.
 */
export function Systems() {
  const [open, setOpen] = useState<number | null>(null);
  const category = open !== null ? SYSTEM_CATEGORIES[open] : null;
  const members = category ? systemsInCategory(category.key) : [];

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section
      id="systems"
      className="w-full scroll-mt-[80px] bg-cream px-[15px] py-[70px] md:px-[30px] md:py-[110px]"
    >
      <Reveal stagger className="grid grid-cols-12 gap-[8px]">
        <div className="col-span-12 md:col-span-7">
          <h2 className="text-[40px] leading-[1.1] tracking-[-0.48px] md:text-[48px]">
            {SYSTEMS_INTRO.heading}
          </h2>
        </div>
        <div className="col-span-12 md:col-span-5">
          <p className="text-[16px] leading-[1.4] md:text-[18px]">{SYSTEMS_INTRO.body}</p>
        </div>
      </Reveal>

      <Reveal stagger className="mt-[40px] grid grid-cols-1 gap-[8px] md:grid-cols-3">
        {SYSTEM_CATEGORIES.map((cat, i) => (
          <div key={cat.key}>
            <button
              onClick={() => setOpen(i)}
              className="group relative block aspect-[3/4] w-full overflow-hidden text-left"
            >
              <Img
                src={SYSTEMS_CARDS[i].src}
                alt={cat.title}
                className="absolute inset-0 h-full w-full"
                imgClassName="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
              <h3 className="absolute left-0 top-0 p-[20px] text-[28px] leading-[1.1] tracking-[-0.36px] text-white md:p-[24px] md:text-[36px]">
                {cat.title}
              </h3>
              <div className="absolute bottom-0 left-0 p-[20px] md:p-[24px]">
                <p className="max-w-[300px] text-[16px] leading-[1.25] text-white md:text-[18px]">{cat.summary}</p>
                <span className="mt-[14px] inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.04em] text-white">
                  See the systems <ArrowIcon className="h-[14px] w-[14px]" />
                </span>
              </div>
            </button>
            <FigCaption info={SYSTEMS_CARDS[i].caption} relation={SYSTEMS_CARDS[i].relation} />
          </div>
        ))}
      </Reveal>

      <div
        onClick={() => setOpen(null)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[70] bg-black/40 transition-opacity duration-300 ease-[var(--ease-standard)]",
          open !== null ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="systems-drawer-title"
        aria-hidden={open === null}
        className={cn(
          "fixed right-0 top-0 z-[71] h-full w-full overflow-y-auto bg-cream p-[20px] transition-transform duration-[var(--dur-drawer)] ease-[var(--ease-drawer)] md:w-[58%] md:p-[40px]",
          open !== null ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.04em]">{category?.title ?? ""}</span>
          <button
            onClick={() => setOpen(null)}
            className="inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.04em] transition-opacity duration-300 hover:opacity-60"
          >
            CLOSE <CloseIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
        <h3 id="systems-drawer-title" className="mt-[40px] text-[28px] leading-[1.15] tracking-[-0.3px] md:text-[36px]">{category?.title ?? ""}</h3>
        <p className="mt-[16px] text-[16px] leading-[1.45] text-ink">{category?.summary ?? ""}</p>
        <div className="mt-[32px]">
          {members.map((sys) => (
            <div key={sys.key} className="border-t border-clay py-[18px]">
              <div className="flex flex-wrap items-baseline justify-between gap-x-[16px]">
                <h4 className="text-[18px] leading-[1.2] text-ink">{sys.name}</h4>
                <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">{sys.type}</span>
              </div>
              <p className="mt-[8px] text-[14px] leading-[1.4] text-ink">{sys.purpose}</p>
              {sys.humanNote && (
                <p className="mt-[6px] text-[13px] leading-[1.4] text-smoke">{sys.humanNote}</p>
              )}
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
