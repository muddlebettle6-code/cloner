import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/reveal";

/**
 * Shared shell for dedicated content pages. Renders the solid header, a
 * consistent page header (eyebrow + title + intro), the page body, and the
 * footer — all using the established Cumulant design tokens.
 */
export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header solid />
      <main className="w-full bg-cream pt-[60px]">
        <Reveal className="px-[15px] pb-[40px] pt-[56px] md:px-[30px] md:pb-[64px] md:pt-[90px]">
          {eyebrow && (
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">{eyebrow}</p>
          )}
          <h1 className="mt-[16px] max-w-[18ch] text-[40px] leading-[1.05] tracking-[-1px] text-ink md:text-[64px]">
            {title}
          </h1>
          {intro && (
            <p className="mt-[22px] max-w-[680px] text-[18px] leading-[1.4] text-ink md:text-[20px]">
              {intro}
            </p>
          )}
        </Reveal>
        {children}
      </main>
      <Footer />
    </>
  );
}
