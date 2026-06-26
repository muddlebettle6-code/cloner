import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { METHODS, METHOD_STAGES, METHOD_PHASES } from "@/lib/site-data";
import type { MethodStage } from "@/types";

export const metadata = { title: "Methods" };

export default function MethodsPage() {
  return (
    <PageShell eyebrow={METHODS.label} title={METHODS.heading} intro={METHODS.body[0]}>
      {/* Lead paragraph */}
      <section className="px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <Reveal>
          <p className="max-w-[680px] text-[18px] leading-[1.4] text-ink md:text-[20px]">
            {METHODS.body[1]}
          </p>
        </Reveal>
      </section>

      {/* Stages */}
      <section className="px-[15px] pb-[60px] md:px-[30px] md:pb-[90px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
          Stages
        </p>
        <Reveal>
          <ol className="mt-[24px]">
            {METHOD_STAGES.map((stage: MethodStage) => (
              <li
                key={stage.n}
                className="flex gap-[16px] border-t border-clay py-[24px] md:gap-[32px]"
              >
                <span className="shrink-0 font-mono text-[16px] text-smoke">
                  {String(stage.n).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-[20px] leading-[1.2] tracking-[-0.4px] text-ink md:text-[24px] md:tracking-[-0.48px]">
                    {stage.title}
                  </h2>
                  <p className="mt-[8px] max-w-[680px] text-[16px] leading-[1.4] text-smoke">
                    {stage.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Phases aside */}
      <section className="px-[15px] pb-[60px] md:px-[30px] md:pb-[90px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
          Phases
        </p>
        <Reveal>
          <dl className="mt-[24px] grid grid-cols-1 gap-[24px] md:grid-cols-2 lg:grid-cols-4">
            {METHOD_PHASES.map((phase) => (
              <div key={phase.title} className="border-t border-clay pt-[16px]">
                <dt className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                  {phase.title}
                </dt>
                <dd className="mt-[12px]">
                  <ul className="space-y-[6px]">
                    {phase.stages.map((stage) => (
                      <li key={stage.n} className="text-[16px] leading-[1.4] text-ink">
                        {stage.title}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>
    </PageShell>
  );
}
