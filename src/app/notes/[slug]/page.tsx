import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/reveal";
import { ArrowIcon } from "@/components/icons";
import { NOTES, getNote } from "@/content/notes";

export function generateStaticParams() {
  return NOTES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = getNote(slug);
  return { title: n ? n.title : "Field note" };
}

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">{children}</p>;
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  return (
    <>
      <Header solid />
      <main className="w-full bg-cream pt-[60px]">
        <article>
          {/* Hero */}
          <Reveal className="px-[15px] pb-[36px] pt-[48px] md:px-[30px] md:pt-[88px]">
            <Link
              href="/notes"
              className="inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke transition-opacity duration-300 hover:opacity-60"
            >
              <ArrowIcon className="h-[13px] w-[13px] rotate-180" /> Field Notes
            </Link>
            <p className="mt-[26px] font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">
              Field note · {fmtDate(note.date)}
            </p>
            <h1 className="mt-[14px] max-w-[24ch] text-[32px] leading-[1.05] tracking-[-0.8px] text-ink md:text-[48px]">
              {note.title}
            </h1>
            <p className="mt-[20px] max-w-[720px] text-[18px] leading-[1.4] text-ink md:text-[21px]">{note.dek}</p>
            {note.tags && note.tags.length > 0 && (
              <p className="mt-[18px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                {note.tags.join(" · ")}
              </p>
            )}
          </Reveal>

          {/* The question */}
          <Reveal as="section" className="border-t border-clay px-[15px] py-[40px] md:px-[30px] md:py-[56px]">
            <SectionLabel>The question</SectionLabel>
            <p className="mt-[16px] max-w-[820px] text-[20px] leading-[1.4] text-ink md:text-[26px] md:leading-[1.35]">
              {note.question}
            </p>
          </Reveal>

          {/* Analysis sections */}
          {note.sections.map((s, i) => (
            <Reveal key={i} as="section" className="border-t border-clay px-[15px] py-[40px] md:px-[30px] md:py-[56px]">
              <SectionLabel>{s.heading}</SectionLabel>
              <p className="mt-[16px] max-w-[760px] text-[16px] leading-[1.6] text-ink md:text-[18px]">{s.body}</p>
            </Reveal>
          ))}

          {/* Takeaways */}
          {note.takeaways && note.takeaways.length > 0 && (
            <Reveal as="section" className="border-t border-clay px-[15px] py-[40px] md:px-[30px] md:py-[56px]">
              <SectionLabel>Takeaways</SectionLabel>
              <ul className="mt-[18px] grid max-w-[820px] grid-cols-1 gap-[2px]">
                {note.takeaways.map((t, i) => (
                  <li key={i} className="flex gap-[16px] border-t border-clay py-[16px] first:border-t-0">
                    <span className="font-mono text-[11px] leading-[1.7] text-smoke">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-[15px] leading-[1.5] text-ink md:text-[16px]">{t}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {/* Sources */}
          {note.sources && note.sources.length > 0 && (
            <Reveal as="section" className="border-t border-clay px-[15px] py-[40px] md:px-[30px] md:py-[56px]">
              <SectionLabel>Sources</SectionLabel>
              <ul className="mt-[16px] flex max-w-[760px] flex-col gap-[12px]">
                {note.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-wrap items-center gap-[10px] text-[15px] leading-[1.45] text-ink underline-offset-4 hover:underline"
                    >
                      {s.title}
                      <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">{s.domain}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {/* Honesty */}
          <Reveal as="section" className="border-t border-clay px-[15px] py-[48px] md:px-[30px] md:py-[64px]">
            <div className="max-w-[820px] rounded-[8px] bg-stone p-[24px] md:p-[32px]">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">How to read this</p>
              <ul className="mt-[12px] flex flex-col gap-[10px]">
                {note.honesty.map((h, i) => (
                  <li key={i} className="text-[13px] leading-[1.5] text-smoke">{h}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </article>
      </main>
      <Footer />
    </>
  );
}
