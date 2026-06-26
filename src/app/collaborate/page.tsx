import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { COLLABORATE } from "@/lib/site-data";

export const metadata = { title: "Collaborate" };

export default function CollaboratePage() {
  return (
    <PageShell
      eyebrow={COLLABORATE.label}
      title={COLLABORATE.heading}
      intro={COLLABORATE.body}
    >
      {/* Collaboration types */}
      <section className="px-[15px] py-[60px] md:px-[30px] md:py-[90px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
          Collaboration types
        </p>
        <Reveal>
          <ul className="mt-[24px] grid grid-cols-1 sm:grid-cols-2">
            {COLLABORATE.types.map((type: string) => (
              <li
                key={type}
                className="border-t border-clay py-[12px] font-mono text-[11px] uppercase text-ink"
              >
                {type}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Primary action + contact */}
      <section className="px-[15px] pb-[60px] md:px-[30px] md:pb-[90px]">
        <Reveal>
          <a
            href={COLLABORATE.primary.href}
            className="inline-flex items-center justify-center rounded-[5px] bg-stone px-[50px] pb-[8px] pt-[12px] font-mono text-[14px] uppercase tracking-[-0.14px] text-ink transition-colors duration-300 hover:bg-clay"
          >
            {COLLABORATE.primary.label}
          </a>
          <p className="mt-[24px] max-w-[440px] text-[15px] leading-[1.5] text-smoke">
            {COLLABORATE.contactNote}
          </p>
          <a
            href={`mailto:${COLLABORATE.contactEmail}`}
            className="mt-[8px] inline-block text-[16px] text-ink underline-offset-2 transition-opacity duration-300 hover:opacity-70"
          >
            {COLLABORATE.contactEmail}
          </a>
        </Reveal>
      </section>
    </PageShell>
  );
}
