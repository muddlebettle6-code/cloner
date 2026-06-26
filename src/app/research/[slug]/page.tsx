import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { getProject, PROJECTS } from "@/lib/site-data";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: p ? p.title : "Project" };
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
      {children}
    </p>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const metaItems: { label: string; value: string }[] = [
    { label: "Status", value: project.status },
    { label: "Version", value: project.version },
    { label: "Date", value: project.date },
    { label: "Authors", value: project.authors.join(", ") },
  ];

  const availability: { label: string; value: string }[] = [
    { label: "Code availability", value: project.codeAvailability },
    { label: "Data availability", value: project.dataAvailability },
    { label: "AI disclosure", value: project.aiDisclosure },
    { label: "Reproduction status", value: project.reproductionStatus },
  ];

  return (
    <PageShell
      eyebrow={project.status}
      title={project.title}
      intro={project.subtitle}
    >
      <div className="px-[15px] pb-[60px] md:px-[30px] md:pb-[90px]">
        <div className="max-w-[760px]">
          {/* Meta row */}
          <Reveal className="border-t border-clay py-[40px] md:py-[56px]">
            <dl className="grid grid-cols-1 gap-[24px] sm:grid-cols-2">
              {metaItems.map((item) => (
                <div key={item.label}>
                  <dt>
                    <Label>{item.label}</Label>
                  </dt>
                  <dd className="mt-[8px] text-[16px] leading-[1.4] text-ink">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Abstract */}
          <Reveal className="border-t border-clay py-[40px] md:py-[56px]">
            <Label>Abstract</Label>
            <p className="mt-[16px] text-[18px] leading-[1.45] text-ink md:text-[20px]">
              {project.abstract}
            </p>
          </Reveal>

          {/* Research question */}
          {project.researchQuestion && (
            <Reveal className="border-t border-clay py-[40px] md:py-[56px]">
              <Label>Research question</Label>
              <p className="mt-[16px] text-[20px] italic leading-[1.4] tracking-[-0.4px] text-ink">
                {project.researchQuestion}
              </p>
            </Reveal>
          )}

          {/* Methods */}
          {project.methods.length > 0 && (
            <Reveal className="border-t border-clay py-[40px] md:py-[56px]">
              <Label>Methods</Label>
              <ul className="mt-[16px] border-t border-clay">
                {project.methods.map((method) => (
                  <li
                    key={method}
                    className="border-b border-clay py-[12px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink"
                  >
                    {method}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {/* Data */}
          <Reveal className="border-t border-clay py-[40px] md:py-[56px]">
            <Label>Data</Label>
            <p className="mt-[16px] text-[16px] leading-[1.45] text-ink">
              {project.data}
            </p>
          </Reveal>

          {/* Results */}
          <Reveal className="border-t border-clay py-[40px] md:py-[56px]">
            <Label>Results</Label>
            <p className="mt-[16px] text-[16px] leading-[1.45] text-ink">
              {project.results}
            </p>
          </Reveal>

          {/* Limitations */}
          <Reveal className="border-t border-clay py-[40px] md:py-[56px]">
            <Label>Limitations</Label>
            <p className="mt-[16px] text-[16px] leading-[1.45] text-ink">
              {project.limitations}
            </p>
          </Reveal>

          {/* Availability grid */}
          <Reveal className="border-t border-clay py-[40px] md:py-[56px]">
            <dl className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              {availability.map((item) => (
                <div
                  key={item.label}
                  className="bg-stone p-[20px] md:p-[24px]"
                >
                  <dt>
                    <Label>{item.label}</Label>
                  </dt>
                  <dd className="mt-[10px] text-[16px] leading-[1.45] text-ink">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Version history */}
          {project.corrections.length > 0 && (
            <Reveal className="border-t border-clay py-[40px] md:py-[56px]">
              <Label>Version history</Label>
              <div className="mt-[24px] space-y-[32px]">
                {project.corrections.map((c, i) => (
                  <div
                    key={`${c.version}-${i}`}
                    className="border-t border-clay pt-[24px]"
                  >
                    <div className="flex flex-wrap gap-x-[24px] gap-y-[4px]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                        {c.date}
                      </p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                        {c.version}
                      </p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                        {c.status}
                      </p>
                    </div>
                    <p className="mt-[16px] text-[16px] leading-[1.45] text-ink">
                      <span className="text-smoke">{c.original}</span>
                      {" → "}
                      <span>{c.revised}</span>
                    </p>
                    <div className="mt-[16px] space-y-[12px]">
                      <div>
                        <Label>Reason</Label>
                        <p className="mt-[6px] text-[16px] leading-[1.45] text-ink">
                          {c.reason}
                        </p>
                      </div>
                      <div>
                        <Label>Effect</Label>
                        <p className="mt-[6px] text-[16px] leading-[1.45] text-ink">
                          {c.effect}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Related */}
          {project.related.length > 0 && (
            <Reveal className="border-t border-clay py-[40px] md:py-[56px]">
              <Label>Related</Label>
              <ul className="mt-[16px] border-t border-clay">
                {project.related.map((relatedSlug) => {
                  const title = getProject(relatedSlug)?.title ?? relatedSlug;
                  return (
                    <li key={relatedSlug} className="border-b border-clay">
                      <Link
                        href={`/research/${relatedSlug}`}
                        className="block py-[16px] text-[18px] leading-[1.4] tracking-[-0.4px] text-ink transition-colors duration-300 hover:text-smoke md:text-[20px]"
                      >
                        {title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          )}
        </div>
      </div>
    </PageShell>
  );
}
