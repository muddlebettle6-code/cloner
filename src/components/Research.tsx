"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { Figure } from "@/components/figure";
import { RESEARCH, RESEARCH_PROGRAMS } from "@/lib/site-data";
import { RESEARCH_FIGS } from "@/lib/site-images";
import type { ResearchProgram } from "@/types";

/**
 * Research programs — tabbed list. Each tab swaps the summary, focus areas, and
 * (placeholder) image. Tab/fade interaction preserved from the cloned section.
 */
export function Research() {
  const [active, setActive] = useState(0);
  const program: ResearchProgram = RESEARCH_PROGRAMS[active];

  return (
    <section
      id="research"
      className="w-full scroll-mt-[80px] bg-cream px-[15px] py-[70px] md:px-[30px] md:py-[110px]"
    >
      <Reveal stagger className="grid grid-cols-12 gap-[24px]">
        <div className="col-span-12 md:col-span-6">
          <h2 className="text-[40px] leading-[1.1] tracking-[-0.48px] md:text-[48px]">{RESEARCH.heading}</h2>
        </div>
        <div className="col-span-12 md:col-span-6">
          <p className="text-[18px] leading-[1.3] text-ink md:text-[24px]">{RESEARCH.body}</p>
        </div>
      </Reveal>

      <div className="mt-[40px] flex flex-wrap gap-[8px]">
        {RESEARCH_PROGRAMS.map((p, i) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "rounded-full px-[16px] py-[7px] font-mono text-[11px] uppercase tracking-[0.04em] transition-colors duration-300",
              active === i ? "bg-stone text-ink" : "text-smoke hover:text-ink"
            )}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div key={active} style={{ animation: "programsFade var(--dur-ui) var(--ease-standard)" }} className="mt-[36px] grid grid-cols-12 gap-[24px]">
        <div className="col-span-12 md:col-span-5">
          <h3 className="text-[24px] leading-[1.1] tracking-[-0.24px] text-ink md:text-[28px]">{program.title}</h3>
          <p className="mt-[16px] text-[18px] leading-[1.35] text-ink md:text-[20px]">{program.summary}</p>

          <div className="mt-[36px]">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">FOCUS</h4>
            <div className="mt-[10px]">
              {program.focus.map((item) => (
                <p key={item} className="font-mono text-[11px] uppercase leading-[1.6] text-ink">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 md:col-start-7">
          <Figure
            src={(RESEARCH_FIGS[active] ?? RESEARCH_FIGS[0]).src}
            caption={(RESEARCH_FIGS[active] ?? RESEARCH_FIGS[0]).caption}
            relation={(RESEARCH_FIGS[active] ?? RESEARCH_FIGS[0]).relation}
            alt={program.title}
            className="aspect-[4/3] w-full"
          />
        </div>
      </div>

      <style>{`@keyframes programsFade{from{opacity:0}to{opacity:1}}`}</style>
    </section>
  );
}
