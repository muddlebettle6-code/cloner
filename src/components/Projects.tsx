"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import {
  PROJECTS_INTRO,
  PROJECT_GROUPS,
  PROJECT_STAGES,
  PROJECT_STATUS_FILTERS,
  RESEARCH_PROGRAMS,
  matchesStatusFilter,
} from "@/lib/site-data";

function pillClass(active: boolean) {
  return cn(
    "rounded-full px-[14px] py-[7px] font-mono text-[11px] uppercase tracking-[0.04em] transition-colors",
    active ? "bg-clay text-ink" : "bg-stone text-smoke hover:text-ink"
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="mb-[10px] block font-mono text-[11px] text-smoke">{label}</span>
      <div className="flex flex-wrap gap-[8px]">
        {options.map((o) => (
          <button key={o} type="button" className={pillClass(value === o)} onClick={() => onChange(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

const PROGRAM_OPTIONS = ["All", ...RESEARCH_PROGRAMS.map((p) => p.title)];

/**
 * Featured projects — research pipeline grouped by program, with a lifecycle
 * progress bar per project and program/status filters. Grouped-rows + bar +
 * filter composition preserved from the cloned pipeline section.
 */
export function Projects() {
  const [program, setProgram] = useState("All");
  const [status, setStatus] = useState("All");

  const groups = useMemo(() => {
    return PROJECT_GROUPS.filter((g) => program === "All" || g.program.title === program)
      .map((g) => ({ ...g, projects: g.projects.filter((p) => matchesStatusFilter(p, status)) }))
      .filter((g) => g.projects.length > 0);
  }, [program, status]);

  return (
    <section
      id="projects"
      className="w-full scroll-mt-[80px] bg-cream px-[15px] py-[70px] md:px-[30px] md:py-[110px]"
    >
      <Reveal>
        <div className="grid grid-cols-12 gap-x-[15px] md:gap-x-[30px]">
          <div className="col-span-12 md:col-span-5">
            <h2 className="text-[40px] leading-[1.1] tracking-[-0.48px] md:text-[48px]">
              {PROJECTS_INTRO.heading}
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6">
            <p className="text-[18px] leading-[1.3] md:text-[24px]">{PROJECTS_INTRO.body}</p>
          </div>
        </div>

        <div className="mt-[40px] flex flex-wrap gap-x-[40px] gap-y-[20px]">
          <FilterGroup label="Program" options={PROGRAM_OPTIONS} value={program} onChange={setProgram} />
          <FilterGroup label="Status" options={PROJECT_STATUS_FILTERS} value={status} onChange={setStatus} />
        </div>
      </Reveal>

      {groups.map((group) => (
        <div key={group.program.key} className="mt-[48px]">
          <h3 className="flex items-center gap-[10px] text-[20px] leading-[1.1] tracking-[-0.16px] md:text-[24px]">
            <span className="text-[12px] leading-none">•</span>
            {group.program.title}
          </h3>

          <div className="mt-[20px] hidden grid-cols-12 md:grid">
            <div className="col-span-5" />
            <div className="col-span-7 grid grid-cols-4">
              {PROJECT_STAGES.map((stage) => (
                <span key={stage} className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                  {stage}
                </span>
              ))}
            </div>
          </div>

          {group.projects.map((project) => (
            <Link
              key={project.slug}
              href={`/research/${project.slug}`}
              className="grid grid-cols-12 items-center gap-y-[6px] border-t border-clay py-[14px] transition-opacity duration-300 hover:opacity-70"
            >
              <div className="col-span-12 md:col-span-5 md:pr-[20px]">
                <h4 className="text-[14px] leading-[1.15] text-ink">{project.title}</h4>
                <p className="mt-[6px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                  {project.status}
                </p>
              </div>
              <div className="col-span-7 hidden gap-[6px] md:flex">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn("h-[10px] flex-1 rounded-full", i < project.stage ? "bg-black" : "bg-clay")}
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>
      ))}
    </section>
  );
}
