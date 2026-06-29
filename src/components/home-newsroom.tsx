// Homepage newsroom block: leads the page with the newsroom — the top story big,
// the newest headlines beside it, a few more, and a "view more" into /articles.
import Link from "next/link";
import { ARTICLES_BY_RECENCY, leadStory } from "@/content/articles";
import { LeadCard, CompactRow, StoryCard } from "@/components/article-cards";
import { Reveal } from "@/components/reveal";
import { ArrowIcon } from "@/components/icons";

export function HomeNewsroom() {
  const lead = leadStory();
  if (!lead) return null;
  const rest = ARTICLES_BY_RECENCY.filter((a) => a.slug !== lead.slug);
  const latest = rest.slice(0, 5);
  const more = rest.slice(5, 8);

  return (
    <section id="newsroom" className="w-full bg-cream px-[15px] pb-[60px] pt-[10px] md:px-[30px] md:pb-[88px] md:pt-[18px]">
      <div className="w-full">
        {/* top story (big) + latest (newest) */}
        <div className="grid gap-[36px] pb-[36px] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-[52px]">
          <Reveal>
            <p className="mb-[14px] font-mono text-[11px] uppercase tracking-[0.1em] text-smoke">Top story</p>
            <LeadCard a={lead} />
          </Reveal>
          <Reveal className="lg:border-l lg:border-clay lg:pl-[44px]">
            <p className="mb-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink">Latest</p>
            <div>
              {latest.map((a, i) => (
                <CompactRow key={a.slug} a={a} first={i === 0} />
              ))}
            </div>
          </Reveal>
        </div>

        {/* a few more recent */}
        {more.length > 0 && (
          <Reveal as="div" stagger className="grid gap-x-[40px] gap-y-[36px] border-t border-clay pt-[36px] sm:grid-cols-2 lg:grid-cols-3">
            {more.map((a) => (
              <StoryCard key={a.slug} a={a} />
            ))}
          </Reveal>
        )}

        {/* view more */}
        <div className="mt-[44px] flex justify-center">
          <Link
            href="/articles"
            className="group inline-flex items-center gap-[10px] border border-ink px-[26px] py-[13px] font-mono text-[11px] uppercase tracking-[0.08em] text-ink transition-colors duration-300 hover:bg-ink hover:text-cream"
          >
            View more stories <ArrowIcon className="h-[11px] w-[11px] transition-transform duration-300 group-hover:translate-x-[3px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
