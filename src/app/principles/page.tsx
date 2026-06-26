import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { PRINCIPLES, PRINCIPLES_INTRO } from "@/lib/site-data";
import type { Principle } from "@/types";

export const metadata: Metadata = {
  title: "Principles",
};

export default function PrinciplesPage() {
  return (
    <PageShell
      eyebrow={PRINCIPLES_INTRO.label}
      title={PRINCIPLES_INTRO.heading}
      intro={PRINCIPLES_INTRO.body}
    >
      <section className="px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <Reveal as="div" className="mx-auto max-w-[960px]">
          <ul>
            {PRINCIPLES.map((principle: Principle) => (
              <li
                key={principle.n}
                className="border-t border-clay py-[28px]"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                  {String(principle.n).padStart(2, "0")}
                </p>
                <h2 className="mt-[12px] text-[24px] leading-[1.15] tracking-[-0.3px] text-ink md:text-[28px]">
                  {principle.title}
                </h2>
                <p className="mt-[12px] max-w-[640px] text-[16px] leading-[1.5] text-smoke md:text-[18px]">
                  {principle.desc}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </PageShell>
  );
}
