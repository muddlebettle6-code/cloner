import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { CORRECTIONS, PROJECTS } from "@/lib/site-data";
import type { Project, ProjectCorrection } from "@/types";

export const metadata: Metadata = {
  title: "Corrections",
};

type FlatCorrection = ProjectCorrection & {
  projectTitle: string;
  projectSlug: string;
};

const FLAT_CORRECTIONS: FlatCorrection[] = PROJECTS.flatMap((project: Project) =>
  project.corrections.map((correction: ProjectCorrection) => ({
    ...correction,
    projectTitle: project.title,
    projectSlug: project.slug,
  }))
);

function CorrectionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-[4px] py-[10px] md:grid-cols-[160px_1fr] md:gap-[24px] md:py-[12px]">
      <dt className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
        {label}
      </dt>
      <dd className="text-[16px] leading-[1.4] text-ink md:text-[18px]">{value}</dd>
    </div>
  );
}

export default function CorrectionsPage() {
  return (
    <PageShell
      eyebrow={CORRECTIONS.label}
      title={CORRECTIONS.heading}
      intro={CORRECTIONS.intro}
    >
      <section className="px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <Reveal as="div" className="mx-auto max-w-[900px]">
          {FLAT_CORRECTIONS.length > 0 && (
            <div>
              {FLAT_CORRECTIONS.map((correction, index) => (
                <article
                  key={`${correction.projectSlug}-${index}`}
                  className="border-t border-clay py-[24px]"
                >
                  <Link
                    href={`/research/${correction.projectSlug}`}
                    className="text-[20px] leading-[1.25] tracking-[-0.4px] text-ink underline-offset-[4px] hover:underline md:text-[24px]"
                  >
                    {correction.projectTitle}
                  </Link>
                  <dl className="mt-[16px] divide-y divide-clay">
                    <CorrectionRow label="Date" value={correction.date} />
                    <CorrectionRow label="Version" value={correction.version} />
                    <CorrectionRow label="Original" value={correction.original} />
                    <CorrectionRow label="Revised" value={correction.revised} />
                    <CorrectionRow label="Reason" value={correction.reason} />
                    <CorrectionRow label="Effect" value={correction.effect} />
                    <CorrectionRow label="Status" value={correction.status} />
                  </dl>
                </article>
              ))}
            </div>
          )}

          <p className="mt-[40px] max-w-[640px] text-[15px] leading-[1.5] text-smoke">
            {CORRECTIONS.emptyState}
          </p>
        </Reveal>
      </section>

      <section className="px-[15px] pb-[60px] md:px-[30px] md:pb-[90px]">
        <Reveal as="div" className="mx-auto max-w-[900px]">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
            Each correction records
          </h2>
          <ul className="mt-[20px] grid grid-cols-1 sm:grid-cols-2">
            {CORRECTIONS.fields.map((field: string) => (
              <li
                key={field}
                className="border-t border-clay py-[12px] font-mono text-[12px] uppercase tracking-[0.04em] text-ink"
              >
                {field}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </PageShell>
  );
}
