import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { REPRODUCIBILITY } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Reproducibility",
};

export default function ReproducibilityPage() {
  return (
    <PageShell
      eyebrow={REPRODUCIBILITY.label}
      title={REPRODUCIBILITY.heading}
      intro={REPRODUCIBILITY.intro}
    >
      <section className="px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <Reveal as="div" className="mx-auto max-w-[960px]">
          <ul className="grid grid-cols-1 sm:grid-cols-2">
            {REPRODUCIBILITY.items.map((item: string) => (
              <li
                key={item}
                className="border-t border-clay py-[12px] font-mono text-[12px] uppercase tracking-[0.04em] text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-[40px] max-w-[640px] text-[15px] italic leading-[1.5] text-smoke">
            {REPRODUCIBILITY.note}
          </p>
        </Reveal>
      </section>
    </PageShell>
  );
}
