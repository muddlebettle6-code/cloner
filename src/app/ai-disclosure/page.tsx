import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { AI_DISCLOSURE } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "AI Disclosure",
};

export default function AiDisclosurePage() {
  return (
    <PageShell
      eyebrow={AI_DISCLOSURE.label}
      title={AI_DISCLOSURE.heading}
      intro={AI_DISCLOSURE.core}
    >
      <section className="px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <Reveal as="div" className="max-w-[760px]">
          <h2 className="text-[24px] leading-[1.15] tracking-[-0.4px] text-ink md:text-[28px]">
            {AI_DISCLOSURE.humanHeading}
          </h2>
          <ul className="mt-[24px]">
            {AI_DISCLOSURE.human.map((item: string) => (
              <li
                key={item}
                className="border-t border-clay py-[14px] text-[16px] leading-[1.4] text-ink md:text-[18px]"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="px-[15px] pb-[60px] md:px-[30px] md:pb-[90px]">
        <Reveal as="div" className="max-w-[760px]">
          <h2 className="text-[24px] leading-[1.15] tracking-[-0.4px] text-ink md:text-[28px]">
            {AI_DISCLOSURE.rulesHeading}
          </h2>
          <ul className="mt-[24px]">
            {AI_DISCLOSURE.rules.map((rule: string) => (
              <li
                key={rule}
                className="border-t border-clay py-[14px] text-[16px] leading-[1.4] text-ink md:text-[18px]"
              >
                {rule}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </PageShell>
  );
}
