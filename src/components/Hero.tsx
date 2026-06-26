import { HeroLiquid } from "@/components/hero-liquid";
import { HERO_IMAGE } from "@/lib/site-images";
import { HERO_CONTENT } from "@/lib/site-data";

export function Hero() {
  return (
    <section id="top" className="relative h-screen w-full overflow-hidden bg-[#0a1622]">
      {/* Liquid-distortion marble (reacts to the cursor; static-image fallback) */}
      <HeroLiquid src={HERO_IMAGE} />
      {/* Scrim for headline legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/15" />

      <div className="absolute inset-x-0 bottom-0 px-[15px] pb-[34px] md:px-[30px] md:pb-[44px]">
        <h1
          className="enter font-sans font-normal text-white text-[34px] leading-[1.02] tracking-[-0.5px] md:text-[80px] md:leading-[80px] md:tracking-[-1.6px]"
          style={{ animationDelay: "120ms" }}
        >
          <span className="block">{HERO_CONTENT.line1}</span>
          <span className="hidden items-center gap-[24px] md:flex">
            <span>{HERO_CONTENT.midLeft}</span>
            <span className="h-px flex-1 bg-white" />
            <span className="whitespace-nowrap">{HERO_CONTENT.midRight}</span>
          </span>
          <span className="md:hidden">
            <span className="block">{HERO_CONTENT.midLeft}</span>
            <span className="block">{HERO_CONTENT.midRight}</span>
          </span>
        </h1>
      </div>
    </section>
  );
}
