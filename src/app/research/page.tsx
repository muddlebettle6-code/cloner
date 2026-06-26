import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { RESEARCH, RESEARCH_PROGRAMS, PROJECT_GROUPS } from "@/lib/site-data";

export const metadata = { title: "Research" };

export default function ResearchPage() {
  return (
    <PageShell eyebrow={RESEARCH.label} title={RESEARCH.heading} intro={RESEARCH.body}>
      <Reveal as="section" className="px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
          Research programs
        </p>
        <div className="mt-[28px]">
          {RESEARCH_PROGRAMS.map((program) => (
            <div key={program.key} className="border-t border-clay py-[28px]">
              <h2 className="text-[24px] leading-[1.1] tracking-[-0.4px] text-ink md:text-[28px] md:tracking-[-0.48px]">
                {program.title}
              </h2>
              <p className="mt-[14px] max-w-[640px] text-[16px] leading-[1.4] text-ink md:text-[18px]">
                {program.summary}
              </p>
              <div className="mt-[18px] flex flex-wrap gap-x-[16px] gap-y-[8px]">
                {program.focus.map((item) => (
                  <span
                    key={item}
                    className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
          Projects
        </p>
        <h2 className="mt-[16px] text-[40px] leading-[1.05] tracking-[-1px] text-ink md:text-[64px]">
          Featured projects.
        </h2>
        <div className="mt-[40px] flex flex-col gap-[48px]">
          {PROJECT_GROUPS.map((group) => (
            <div key={group.program.key}>
              <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                {group.program.title}
              </p>
              <div className="mt-[12px]">
                {group.projects.map((project) => (
                  <Link
                    key={project.slug}
                    href={`/research/${project.slug}`}
                    className="flex flex-col gap-[6px] border-t border-clay py-[18px] transition-opacity duration-300 hover:opacity-70 md:flex-row md:items-baseline md:justify-between md:gap-[24px]"
                  >
                    <span className="flex flex-col gap-[4px]">
                      <span className="text-[18px] leading-[1.3] text-ink">{project.title}</span>
                      <span className="text-[14px] leading-[1.4] text-smoke">
                        {project.subtitle}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                      {project.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </PageShell>
  );
}
