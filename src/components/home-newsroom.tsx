// Homepage newsroom — WSJ-style front page (dominant story centre, text-led
// secondary left, newest right; faint hairline rules), but wrapped in the same
// house formatting as the rest of the page: cream section, py rhythm, a 12-col
// grid, and the heading + intro header every other section uses.
import Link from "next/link";
import { ARTICLES_BY_RECENCY, leadStory } from "@/content/articles";
import { LeadCard, CompactRow, StoryCard, TextStory } from "@/components/article-cards";
import { Reveal } from "@/components/reveal";
import { ArrowIcon } from "@/components/icons";

export function HomeNewsroom() {
  const lead = leadStory();
  if (!lead) return null;
  const rest = ARTICLES_BY_RECENCY.filter((a) => a.slug !== lead.slug);
  const latest = rest.slice(0, 5); // right column — newest
  const secondary = rest.slice(5, 8); // left column — text-led
  const more = rest.slice(8, 11); // bottom row

  return (
    <section
      id="newsroom"
      className="w-full scroll-mt-[80px] bg-cream px-[15px] py-[70px] md:px-[30px] md:py-[110px]"
    >
      {/* house header: heading left, intro right (same pattern as other sections) */}
      <Reveal stagger className="grid grid-cols-12 gap-[20px]">
        <h2 className="col-span-12 text-[32px] leading-[1.1] tracking-[-0.48px] text-ink md:col-span-7 md:text-[48px]">
          The newsroom
        </h2>
        <div className="col-span-12 md:col-span-4 md:col-start-9">
          <p className="text-[16px] leading-[1.4] text-ink">
            Independent analysis of the events moving markets, the economy, and policy, one consequential question at a time.
          </p>
        </div>
      </Reveal>

      {/* WSJ-style front page on the 12-col grid, faint rules between columns */}
      <div className="mt-[40px] grid grid-cols-12 gap-y-[28px] border-t border-clay pt-[34px] md:mt-[48px]">
        {/* LEFT (desktop) / last (mobile) — text-led secondary stories */}
        <Reveal className="order-3 col-span-12 border-t border-clay pt-[22px] lg:order-1 lg:col-span-3 lg:border-t-0 lg:pr-[28px] lg:pt-0">
          {secondary.map((a, i) => (
            <TextStory key={a.slug} a={a} first={i === 0} />
          ))}
        </Reveal>

        {/* CENTRE — dominant top story (leads on mobile; faint left rule on desktop) */}
        <Reveal className="order-1 col-span-12 lg:order-2 lg:col-span-6 lg:border-l lg:border-clay lg:px-[32px]">
          <LeadCard a={lead} />
        </Reveal>

        {/* RIGHT (desktop) / second (mobile) — newest */}
        <Reveal className="order-2 col-span-12 border-t border-clay pt-[22px] lg:order-3 lg:col-span-3 lg:border-l lg:border-clay lg:border-t-0 lg:pl-[28px] lg:pt-0">
          <p className="mb-[2px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink">Latest</p>
          <div>
            {latest.map((a, i) => (
              <CompactRow key={a.slug} a={a} first={i === 0} />
            ))}
          </div>
        </Reveal>
      </div>

      {/* more stories, then view-more */}
      {more.length > 0 && (
        <Reveal as="div" stagger className="mt-[40px] grid grid-cols-1 gap-x-[30px] gap-y-[36px] border-t border-clay pt-[40px] md:mt-[48px] md:grid-cols-3">
          {more.map((a) => (
            <StoryCard key={a.slug} a={a} />
          ))}
        </Reveal>
      )}

      <div className="mt-[44px] flex justify-center">
        <Link
          href="/articles"
          className="group inline-flex items-center gap-[10px] rounded-full border border-clay bg-white px-[26px] py-[14px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink transition-colors duration-300 hover:bg-ink hover:text-cream"
        >
          View more stories <ArrowIcon className="h-[12px] w-[12px] transition-transform duration-300 group-hover:translate-x-[3px]" />
        </Link>
      </div>
    </section>
  );
}
