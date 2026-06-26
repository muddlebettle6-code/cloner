import { MediaBand } from "@/components/media-band";
import { Reveal } from "@/components/reveal";
import { Figure } from "@/components/figure";
import { INTRO } from "@/lib/site-data";
import { INTRO_SMALL, INTRO_BAND } from "@/lib/site-images";

/**
 * Homepage introduction — heading, a two-column lead + body, a small captioned
 * figure, and a full-bleed two-image band beneath.
 */
export function Intro() {
  return (
    <>
      <section className="w-full bg-cream px-[15px] py-[70px] md:px-[30px] md:py-[110px]">
        <Reveal>
          <h2 className="text-[32px] leading-[1.1] tracking-[-0.48px] text-ink md:text-[48px]">
            {INTRO.heading}
          </h2>
        </Reveal>

        <div className="mt-[36px] grid grid-cols-12 gap-[20px] md:mt-[48px]">
          <div className="col-span-12 md:col-span-7">
            <p className="text-[22px] leading-[1.3] tracking-[-0.16px] text-ink md:text-[24px]">
              {INTRO.lead}
            </p>
            {INTRO.body.map((para) => (
              <p key={para} className="mt-[22px] text-[16px] leading-[1.45] text-ink">
                {para}
              </p>
            ))}
          </div>

          <div className="col-span-12 md:col-span-3 md:col-start-10">
            <Figure
              src={INTRO_SMALL.src}
              caption={INTRO_SMALL.caption}
              relation={INTRO_SMALL.relation}
              alt={INTRO_SMALL.caption}
              className="aspect-square w-[210px] md:ml-auto md:w-full"
            />
          </div>
        </div>
      </section>

      <MediaBand images={INTRO_BAND} alt="" height="h-[260px] md:h-[523px]" />
    </>
  );
}
