import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { PRINCIPLES, PRINCIPLES_INTRO } from "@/lib/site-data";
import type { Principle } from "@/types";

/**
 * Principles — "The rules behind the work." A 3-column grid of numbered text
 * cards. Grid + stagger-reveal preserved from the cloned press section; the
 * thumbnail slot is replaced with a number tile (no fabricated imagery).
 */
export function Principles() {
  return (
    <section
      id="principles"
      className="w-full scroll-mt-[80px] bg-cream px-[15px] py-[70px] md:px-[30px] md:py-[110px]"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-[40px] leading-[1.1] tracking-[-0.48px] md:text-[48px]">
          {PRINCIPLES_INTRO.heading}
        </h2>
        <Link
          href="/principles"
          className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink transition-opacity duration-300 hover:opacity-60"
        >
          READ THE PRINCIPLES
        </Link>
      </div>

      <Reveal stagger className="mt-[40px] grid grid-cols-1 gap-x-[24px] gap-y-[28px] md:grid-cols-3">
        {PRINCIPLES.map((p: Principle) => (
          <article key={p.n} className="flex gap-[16px] border-t border-clay pt-[16px]">
            <div className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center bg-stone font-mono text-[16px] text-smoke">
              {String(p.n).padStart(2, "0")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] leading-[1.15] text-ink">{p.title}</p>
              <p className="mt-[6px] text-[13px] leading-[1.3] text-smoke">{p.desc}</p>
            </div>
          </article>
        ))}
      </Reveal>
    </section>
  );
}
