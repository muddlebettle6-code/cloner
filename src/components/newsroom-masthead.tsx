import { HeroLiquid } from "@/components/hero-liquid";
import { HERO_IMAGE } from "@/lib/site-images";

/**
 * Full-bleed newsroom masthead: the cursor-reactive liquid marble behind a large
 * white title, with a dark scrim for contrast. The clean, contained content sits
 * below it.
 */
export function NewsroomMasthead({ title, kicker, intro }: { title: string; kicker?: string; intro?: string }) {
  return (
    <section className="relative w-full overflow-hidden bg-[#0a1622]">
      <div className="absolute inset-0">
        <HeroLiquid src={HERO_IMAGE} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/55" />
      <div className="relative z-10 mx-auto max-w-[1600px] px-[15px] py-[58px] md:px-[30px] md:py-[92px]">
        {kicker && (
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">{kicker}</p>
        )}
        <h1 className="mt-[14px] text-[44px] leading-[0.98] tracking-[-1.8px] text-white md:text-[78px]">{title}</h1>
        {intro && (
          <p className="mt-[20px] max-w-[620px] text-[17px] leading-[1.45] text-white/85 md:text-[20px]">{intro}</p>
        )}
      </div>
    </section>
  );
}
