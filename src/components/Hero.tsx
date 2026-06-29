import { HERO_CONTENT } from "@/lib/site-data";

// Text-only hero on white: the tagline on ONE line in clean magenta, with the
// connecting rule between the halves.
export function Hero() {
  return (
    <section
      id="top"
      className="relative w-full overflow-hidden bg-cream px-[15px] pb-[24px] pt-[100px] md:px-[30px] md:pb-[36px] md:pt-[116px]"
    >
      <div className="enter" style={{ animationDelay: "120ms" }}>
        <h1
          className="flex w-full items-center gap-[14px] whitespace-nowrap font-sans font-normal leading-none tracking-[-1.5px] text-[#ff2d92] md:gap-[30px]"
          style={{ fontSize: "clamp(20px, 5.4vw, 84px)" }}
        >
          <span>{HERO_CONTENT.line1} {HERO_CONTENT.midLeft}</span>
          <span className="h-[4px] flex-1 self-center rounded-full bg-[#ff2d92] md:h-[6px]" />
          <span>{HERO_CONTENT.midRight}</span>
        </h1>
      </div>
    </section>
  );
}
