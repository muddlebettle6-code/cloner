"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { PlusIcon, MinusIcon } from "@/components/icons";
import { METHODS, METHOD_PHASES } from "@/lib/site-data";
import type { MethodPhase } from "@/types";

/**
 * Methods — "From question to auditable result." The twelve workflow stages
 * grouped into four process phases. Flowchart pills + per-column expand
 * interaction preserved from the cloned section.
 */
export function Methods() {
  const [expanded, setExpanded] = useState<boolean[]>(() => METHOD_PHASES.map(() => false));

  const toggle = (i: number) =>
    setExpanded((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <section
      id="methods"
      className="w-full scroll-mt-[80px] bg-cream px-[15px] py-[70px] md:px-[30px] md:py-[110px]"
    >
      <Reveal stagger className="grid grid-cols-12 items-start gap-[20px]">
        <h2 className="col-span-12 text-[32px] leading-[1.1] tracking-[-0.48px] text-ink md:col-span-7 md:text-[48px]">
          {METHODS.heading}
        </h2>
        <div className="col-span-12 md:col-span-4 md:col-start-9">
          <p className="text-[16px] leading-[1.4] text-ink">{METHODS.body[0]}</p>
          <p className="mt-[16px] text-[16px] leading-[1.4] text-ink">{METHODS.body[1]}</p>
        </div>
      </Reveal>

      <Reveal stagger className="mt-[40px] grid grid-cols-1 gap-[16px] rounded-[20px] bg-stone p-[16px] md:grid-cols-4 md:p-[24px]">
        {METHOD_PHASES.map((phase: MethodPhase, i: number) => {
            const isOpen = expanded[i];
            return (
              <div key={phase.title} className="flex flex-col">
                <div className="rounded-full border border-clay bg-white py-[14px] text-center font-mono text-[11px] uppercase tracking-[0.04em] text-ink">
                  {phase.title}
                </div>

                <div
                  aria-hidden
                  className="mx-auto hidden h-[28px] w-px border-l border-dashed border-clay md:block"
                />

                <div className="flex flex-1 flex-col rounded-[12px] border border-clay bg-white p-[20px]">
                  <div className="flex flex-col">
                    {phase.stages.map((stage) => (
                      <div key={stage.n} className="border-t border-clay py-[12px] first:border-t-0 first:pt-0">
                        <span className="flex items-baseline gap-[10px]">
                          <span className="font-mono text-[11px] tracking-[0.04em] text-smoke">
                            {String(stage.n).padStart(2, "0")}
                          </span>
                          <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink">
                            {stage.title}
                          </span>
                        </span>
                        <div
                          className={cn(
                            "grid overflow-hidden transition-all duration-[var(--dur-ui)] ease-[var(--ease-standard)]",
                            isOpen ? "mt-[8px] grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          )}
                        >
                          <p className="min-h-0 overflow-hidden pl-[26px] text-[13px] leading-[1.35] text-smoke">
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? `Collapse ${phase.title} details` : `Expand ${phase.title} details`}
                    className={cn("mt-auto pt-[12px] text-ink transition-opacity duration-300 hover:opacity-70")}
                  >
                    {isOpen ? <MinusIcon className="h-[22px] w-[22px]" /> : <PlusIcon className="h-[22px] w-[22px]" />}
                  </button>
                </div>
              </div>
            );
          })}
      </Reveal>
    </section>
  );
}
