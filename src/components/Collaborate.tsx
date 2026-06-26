import { Reveal } from "@/components/reveal";
import { COLLABORATE } from "@/lib/site-data";

/**
 * Collaborate — invitation + collaboration types + a single email action.
 * Styled with the established tokens (no new design system); no fake links.
 */
export function Collaborate() {
  return (
    <section
      id="collaborate"
      className="w-full scroll-mt-[80px] bg-cream px-[15px] py-[70px] md:px-[30px] md:py-[110px]"
    >
      <Reveal stagger className="grid grid-cols-12 gap-[24px]">
        <div className="col-span-12 md:col-span-7">
          <h2 className="text-[32px] leading-[1.1] tracking-[-0.48px] md:text-[48px]">{COLLABORATE.heading}</h2>
        </div>
        <div className="col-span-12 md:col-span-5">
          <p className="text-[18px] leading-[1.35] text-ink md:text-[20px]">{COLLABORATE.body}</p>
        </div>
      </Reveal>

      <div className="mt-[40px] grid grid-cols-12 items-center gap-[24px]">
        <div className="col-span-12 md:col-span-7">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">Collaboration types</h3>
          <div className="mt-[14px] grid grid-cols-1 gap-x-[24px] sm:grid-cols-2">
            {COLLABORATE.types.map((t) => (
              <p key={t} className="border-t border-clay py-[12px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink">
                {t}
              </p>
            ))}
          </div>
        </div>

        <div className="col-span-12 flex flex-col items-center text-center md:col-span-5">
          <a
            href={COLLABORATE.primary.href}
            className="inline-flex items-center justify-center rounded-[5px] bg-stone px-[50px] pb-[8px] pt-[12px] font-mono text-[14px] uppercase tracking-[-0.14px] text-ink transition-colors duration-300 hover:bg-clay"
          >
            {COLLABORATE.primary.label}
          </a>
          <p className="mt-[18px] max-w-[330px] text-[13px] leading-[1.45] text-smoke">
            {COLLABORATE.contactNote}
          </p>
          <a
            href={`mailto:${COLLABORATE.contactEmail}`}
            className="mt-[8px] inline-block text-[14px] text-ink underline-offset-2 transition-opacity duration-300 hover:opacity-70"
          >
            {COLLABORATE.contactEmail}
          </a>
        </div>
      </div>
    </section>
  );
}
