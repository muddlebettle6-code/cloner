import Link from "next/link";
import { HeroLiquid } from "@/components/hero-liquid";
import { HERO_IMAGE } from "@/lib/site-images";

export const metadata = { title: "404 · Page not found" };

export default function NotFound() {
  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a1622] text-center">
      {/* Liquid marble background (reacts to the cursor) */}
      <HeroLiquid src={HERO_IMAGE} />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 px-[20px] text-white">
        <p className="font-sans font-normal leading-[0.85] tracking-[-4px] text-[110px] md:text-[220px]">404</p>
        <p className="mt-[6px] font-sans text-[22px] tracking-[-0.5px] md:text-[34px]">Outside the distribution.</p>
        <p className="mx-auto mt-[16px] max-w-[460px] text-[15px] leading-[1.5] text-white/75 md:text-[16px]">
          This page does not exist, or it has moved. Everything else on the site still traces back to its source.
        </p>
        <Link
          href="/"
          className="mt-[32px] inline-flex items-center justify-center rounded-[5px] bg-white px-[30px] pb-[10px] pt-[12px] font-mono text-[12px] uppercase tracking-[0.04em] text-ink transition-opacity duration-300 hover:opacity-80"
        >
          Back to Cumulant
        </Link>
      </div>
    </section>
  );
}
