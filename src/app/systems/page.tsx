import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import {
  SYSTEMS_INTRO,
  SYSTEM_CATEGORIES,
  systemsInCategory,
} from "@/lib/site-data";
import type { ResearchSystem, SystemCategory } from "@/types";

export const metadata = { title: "Systems" };

export default function SystemsPage() {
  return (
    <PageShell
      eyebrow={SYSTEMS_INTRO.label}
      title={SYSTEMS_INTRO.heading}
      intro={SYSTEMS_INTRO.body}
    >
      <div className="px-[15px] pb-[60px] md:px-[30px] md:pb-[90px]">
        {SYSTEM_CATEGORIES.map((category: SystemCategory) => {
          const systems = systemsInCategory(category.key);
          return (
            <Reveal
              as="section"
              key={category.key}
              className="py-[60px] md:py-[90px]"
            >
              <header className="max-w-[640px]">
                <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                  {category.key}
                </p>
                <h2 className="mt-[12px] text-[28px] leading-[1.1] tracking-[-0.48px] text-ink md:text-[36px]">
                  {category.title}
                </h2>
                <p className="mt-[14px] text-[16px] leading-[1.5] text-smoke">
                  {category.summary}
                </p>
              </header>

              <ul className="mt-[32px]">
                {systems.map((system: ResearchSystem) => (
                  <li
                    key={system.key}
                    className="border-t border-clay py-[20px]"
                  >
                    <div className="flex flex-col gap-[4px] md:flex-row md:items-baseline md:justify-between md:gap-[24px]">
                      <h3 className="text-[18px] leading-[1.3] tracking-[-0.4px] text-ink md:text-[20px]">
                        {system.name}
                      </h3>
                      <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke md:flex-none md:text-right">
                        {system.type}
                      </span>
                    </div>
                    <p className="mt-[10px] max-w-[640px] text-[15px] leading-[1.5] text-ink">
                      {system.purpose}
                    </p>
                    {system.humanNote && (
                      <p className="mt-[8px] max-w-[640px] text-[13px] leading-[1.5] text-smoke">
                        {system.humanNote}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </PageShell>
  );
}
