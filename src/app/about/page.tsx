import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ABOUT, FOUNDER, INFRASTRUCTURE, SOURCES } from "@/lib/site-data";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PageShell eyebrow={ABOUT.label} title={ABOUT.heading} intro={ABOUT.body[0]}>
      {/* About prose */}
      <Reveal as="section" className="px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <div className="flex max-w-[680px] flex-col gap-[20px] md:gap-[24px]">
          {ABOUT.body.slice(1).map((paragraph, i) => (
            <p key={i} className="text-[18px] leading-[1.45] text-ink md:text-[20px]">
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>

      {/* Founder */}
      <Reveal as="section" className="border-t border-clay px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">Founder</p>
        <h2 className="mt-[16px] text-[24px] leading-[1.1] tracking-[-0.4px] text-ink md:text-[28px] md:tracking-[-0.48px]">
          {FOUNDER.name}
        </h2>
        <p className="mt-[6px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
          {FOUNDER.title}
        </p>
        <div className="mt-[24px] flex max-w-[640px] flex-col gap-[16px]">
          {FOUNDER.bio.map((paragraph, i) => (
            <p key={i} className="text-[16px] leading-[1.45] text-ink">
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>

      {/* Infrastructure */}
      <Reveal as="section" className="border-t border-clay px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <h2 className="max-w-[18ch] text-[28px] leading-[1.1] tracking-[-0.4px] text-ink md:text-[36px] md:tracking-[-0.48px]">
          {INFRASTRUCTURE.heading}
        </h2>
        <p className="mt-[16px] max-w-[680px] text-[16px] leading-[1.45] text-smoke">
          {INFRASTRUCTURE.intro}
        </p>
        <ul className="mt-[36px] grid grid-cols-1 border-t border-clay md:grid-cols-2">
          {INFRASTRUCTURE.components.map((component) => (
            <li
              key={component}
              className="border-b border-clay py-[14px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink"
            >
              {component}
            </li>
          ))}
        </ul>
        <p className="mt-[20px] max-w-[680px] text-[13px] italic leading-[1.5] text-smoke">
          {INFRASTRUCTURE.note}
        </p>
      </Reveal>

      {/* Sources */}
      <Reveal as="section" className="border-t border-clay px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <h2 className="max-w-[18ch] text-[28px] leading-[1.1] tracking-[-0.4px] text-ink md:text-[36px] md:tracking-[-0.48px]">
          {SOURCES.heading}
        </h2>
        <p className="mt-[16px] max-w-[680px] text-[16px] leading-[1.45] text-smoke">
          {SOURCES.intro}
        </p>
        <ul className="mt-[36px] flex flex-wrap gap-[10px]">
          {SOURCES.list.map((source) => (
            <li
              key={source}
              className="rounded-[2px] border border-clay bg-stone px-[12px] py-[8px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink"
            >
              {source}
            </li>
          ))}
        </ul>
      </Reveal>
    </PageShell>
  );
}
