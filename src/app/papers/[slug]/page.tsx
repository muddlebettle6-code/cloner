import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/reveal";
import { Img } from "@/components/img";
import { ArrowIcon } from "@/components/icons";
import { PAPERS, getPaper } from "@/content/papers";

export function generateStaticParams() {
  return PAPERS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPaper(slug);
  return { title: p ? p.title : "Paper" };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">{children}</p>;
}

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = getPaper(slug);
  if (!paper) notFound();

  return (
    <>
      <Header solid />
      <main className="w-full bg-cream pt-[60px]">
        <article>
          {/* Hero */}
          <Reveal className="px-[15px] pb-[36px] pt-[48px] md:px-[30px] md:pt-[88px]">
            <Link
              href="/papers"
              className="inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke transition-opacity duration-300 hover:opacity-60"
            >
              <ArrowIcon className="h-[13px] w-[13px] rotate-180" /> Papers
            </Link>
            <p className="mt-[26px] font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">{paper.status}</p>
            <h1 className="mt-[14px] max-w-[20ch] text-[32px] leading-[1.05] tracking-[-0.8px] text-ink md:text-[52px]">
              {paper.title}
            </h1>
            {paper.subtitle && (
              <p className="mt-[20px] max-w-[720px] text-[18px] leading-[1.4] text-ink md:text-[21px]">
                {paper.subtitle}
              </p>
            )}
            <p className="mt-[20px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
              {paper.authors.join(", ")} · {paper.date}
            </p>
            {paper.pdf && (
              <a
                href={paper.pdf}
                target="_blank"
                rel="noreferrer"
                className="mt-[22px] inline-flex items-center gap-[8px] rounded-[5px] bg-ink px-[22px] pb-[9px] pt-[11px] font-mono text-[11px] uppercase tracking-[0.04em] text-white transition-opacity duration-300 hover:opacity-80"
              >
                Read the full paper (PDF) <ArrowIcon className="h-[13px] w-[13px]" />
              </a>
            )}
          </Reveal>

          {/* Abstract */}
          <Reveal as="section" className="border-t border-clay px-[15px] py-[48px] md:px-[30px] md:py-[64px]">
            <SectionLabel>Abstract</SectionLabel>
            <p className="mt-[18px] max-w-[760px] text-[17px] leading-[1.55] text-ink md:text-[19px]">
              {paper.abstract}
            </p>
          </Reveal>

          {/* Key findings */}
          {paper.contributions && paper.contributions.length > 0 && (
            <Reveal as="section" className="border-t border-clay px-[15px] py-[48px] md:px-[30px] md:py-[64px]">
              <SectionLabel>Key findings</SectionLabel>
              <ol className="mt-[20px] grid max-w-[820px] grid-cols-1 gap-[2px]">
                {paper.contributions.map((c, i) => (
                  <li key={i} className="flex gap-[16px] border-t border-clay py-[16px] first:border-t-0">
                    <span className="font-mono text-[11px] leading-[1.6] text-smoke">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-[15px] leading-[1.5] text-ink md:text-[16px]">{c}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}

          {/* Figures */}
          {paper.figures && paper.figures.length > 0 && (
            <Reveal as="section" stagger className="border-t border-clay px-[15px] py-[48px] md:px-[30px] md:py-[64px]">
              <SectionLabel>Figures</SectionLabel>
              <div className="mt-[24px] grid grid-cols-1 gap-[40px]">
                {paper.figures.map((f) => (
                  <figure key={f.src} className="max-w-[860px]">
                    <Img
                      src={f.src}
                      alt={f.alt}
                      className="w-full border border-clay bg-white"
                      imgClassName="object-contain p-[16px] md:p-[24px]"
                    />
                    <figcaption className="mt-[12px] max-w-[760px] text-[13px] leading-[1.5] text-smoke">
                      {f.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>
          )}

          {/* Method */}
          {paper.method && paper.method.length > 0 && (
            <Reveal as="section" className="border-t border-clay px-[15px] py-[48px] md:px-[30px] md:py-[64px]">
              <SectionLabel>How the method works</SectionLabel>
              <div className="mt-[18px] flex max-w-[760px] flex-col gap-[18px]">
                {paper.method.map((m, i) => (
                  <p key={i} className="text-[16px] leading-[1.55] text-ink md:text-[17px]">
                    {m}
                  </p>
                ))}
              </div>
            </Reveal>
          )}

          {/* Data + honest caveats */}
          {(paper.dataNote || (paper.honesty && paper.honesty.length > 0)) && (
            <Reveal as="section" className="border-t border-clay px-[15px] py-[48px] md:px-[30px] md:py-[64px]">
              <div className="max-w-[820px] rounded-[8px] bg-stone p-[24px] md:p-[32px]">
                {paper.dataNote && (
                  <>
                    <SectionLabel>Data</SectionLabel>
                    <p className="mt-[12px] text-[14px] leading-[1.5] text-ink">{paper.dataNote}</p>
                  </>
                )}
                {paper.honesty && paper.honesty.length > 0 && (
                  <>
                    <p className={`font-mono text-[11px] uppercase tracking-[0.06em] text-smoke ${paper.dataNote ? "mt-[24px]" : ""}`}>
                      How to read this
                    </p>
                    <ul className="mt-[12px] flex flex-col gap-[10px]">
                      {paper.honesty.map((h, i) => (
                        <li key={i} className="text-[13px] leading-[1.5] text-smoke">
                          {h}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Reveal>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
