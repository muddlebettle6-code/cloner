import { Img } from "@/components/img";
import { Reveal } from "@/components/reveal";
import { MANIFESTO_BG } from "@/lib/site-images";
import { MANIFESTO } from "@/lib/site-data";

/**
 * Closing manifesto — full-viewport (placeholder) background with a centered
 * mono uppercase statement. Composition/motion preserved from the cloned poem.
 */
export function Manifesto() {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <Img
        src={MANIFESTO_BG}
        alt="Deep blue abstract"
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-black/35" />
      <Reveal className="relative z-10 px-[20px] text-center font-mono uppercase text-white">
        {MANIFESTO.lines.map((line) => (
          <p key={line} className="text-[11px] leading-[2.0] tracking-[0.06em] md:text-[13px]">
            {line}
          </p>
        ))}
        <p className="mt-[24px] text-[11px] leading-[2.0] tracking-[0.06em] md:text-[13px]">
          {MANIFESTO.attribution}
        </p>
      </Reveal>
    </section>
  );
}
