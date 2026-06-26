import Link from "next/link";
import { Figure } from "@/components/figure";
import { Reveal } from "@/components/reveal";
import { ABOUT_IMAGE } from "@/lib/site-images";
import { ABOUT } from "@/lib/site-data";

/**
 * About band — placeholder portrait left, heading + short blurb + route CTA
 * right. Two-column composition preserved from the cloned section.
 */
export function About() {
  return (
    <section
      id="about"
      className="w-full scroll-mt-[80px] bg-cream px-[15px] py-[70px] md:px-[30px] md:py-[110px]"
    >
      <div className="grid grid-cols-12 items-center gap-[24px]">
        <div className="col-span-12 md:col-span-6">
          <Figure
            src={ABOUT_IMAGE.src}
            caption={ABOUT_IMAGE.caption}
            relation={ABOUT_IMAGE.relation}
            alt={ABOUT_IMAGE.caption}
            className="aspect-[4/3] w-full md:aspect-square"
          />
        </div>
        <Reveal className="col-span-12 md:col-span-5 md:col-start-8">
          <h2 className="text-[40px] leading-[1.1] tracking-[-0.48px] text-ink md:text-[48px]">
            {ABOUT.heading}
          </h2>
          <p className="mt-[18px] max-w-[440px] text-[18px] leading-[1.35] text-ink md:text-[20px]">
            {ABOUT.short}
          </p>
          <Link
            href="/about"
            className="mt-[28px] inline-flex items-center justify-center rounded-[5px] bg-stone px-[50px] pb-[8px] pt-[12px] font-mono text-[14px] uppercase tracking-[-0.14px] text-ink transition-colors duration-300 hover:bg-clay"
          >
            Learn more
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
