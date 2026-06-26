import type { Statement } from "@/types";
import { Reveal } from "@/components/reveal";

/**
 * Large statement block: grey eyebrow column (label + source) left, large 36px
 * statement right with a hanging serif opening quote mark. The label column is
 * nudged so its first line sits level with the larger quote's first line.
 */
export function QuoteBlock({ statement }: { statement: Statement }) {
  return (
    <div className="w-full bg-cream px-[15px] py-[80px] md:px-[30px] md:py-[120px]">
      <Reveal className="grid grid-cols-12 gap-x-[20px] gap-y-8">
        <div className="col-span-12 md:col-span-3 md:mt-[3px]">
          <h2 className="text-[24px] leading-[24px] tracking-[-0.16px] text-smoke">{statement.eyebrow}</h2>
          <p className="mt-[10px] text-[18px] leading-[1.3] tracking-[-0.16px] text-smoke">{statement.source}</p>
        </div>
        <div className="col-span-12 md:col-span-8 md:col-start-4">
          <p className="relative text-[28px] leading-[1.2] tracking-[-0.72px] text-ink md:text-[36px]">
            <span className="absolute -left-[18px] top-[-2px] select-none font-serif text-ink md:-left-[22px]">“</span>
            {statement.text}
          </p>
        </div>
      </Reveal>
    </div>
  );
}
