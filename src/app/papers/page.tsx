import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Img } from "@/components/img";
import { ArrowIcon } from "@/components/icons";
import { PAPERS, PAPERS_INTRO } from "@/content/papers";

export const metadata = { title: "Papers" };

export default function PapersPage() {
  return (
    <PageShell eyebrow={PAPERS_INTRO.label} title={PAPERS_INTRO.heading} intro={PAPERS_INTRO.body}>
      <Reveal as="section" stagger className="px-[15px] pb-[80px] md:px-[30px] md:pb-[120px]">
        {PAPERS.map((p) => (
          <Link
            key={p.slug}
            href={`/papers/${p.slug}`}
            className="group block border-t border-clay py-[28px] transition-opacity duration-300 last:border-b hover:opacity-70 md:py-[34px]"
          >
            <div className="grid grid-cols-12 items-start gap-[16px] md:gap-[24px]">
              <div className="col-span-12 md:col-span-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                  {p.status} · {p.date}
                </p>
                <h2 className="mt-[10px] text-[24px] leading-[1.12] tracking-[-0.4px] text-ink md:text-[30px]">
                  {p.title}
                </h2>
                <p className="mt-[10px] max-w-[640px] text-[15px] leading-[1.45] text-smoke">{p.oneLine}</p>
                <span className="mt-[14px] inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink">
                  Read the paper <ArrowIcon className="h-[14px] w-[14px]" />
                </span>
              </div>
              {p.figures?.[0] && (
                <div className="col-span-12 md:col-span-4">
                  <Img
                    src={p.figures[0].src}
                    alt={p.figures[0].alt}
                    className="aspect-[16/10] w-full border border-clay bg-white"
                    imgClassName="object-contain p-[12px]"
                  />
                </div>
              )}
            </div>
          </Link>
        ))}
      </Reveal>
    </PageShell>
  );
}
