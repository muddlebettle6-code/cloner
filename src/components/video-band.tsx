import { FigCaption } from "@/components/figure";
import { cn } from "@/lib/utils";

/**
 * Full-bleed background video band (muted, looping, autoplay) with a caption
 * placard beneath it. Used for the neural-network band below the hero.
 */
export function VideoBand({
  src,
  poster,
  caption,
  relation,
  height = "h-[360px] md:h-[576px]",
}: {
  src: string;
  poster?: string;
  caption?: string;
  relation?: string;
  height?: string;
}) {
  return (
    <div className="w-full bg-cream">
      <div className={cn("relative w-full overflow-hidden", height)}>
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      </div>
      {caption && <FigCaption info={caption} relation={relation} className="px-[15px] md:px-[30px]" />}
    </div>
  );
}
