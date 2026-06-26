import { Img } from "@/components/img";
import { Parallax } from "@/components/parallax";
import { FigCaption } from "@/components/figure";
import type { Figure } from "@/lib/site-images";
import { cn } from "@/lib/utils";

/**
 * Full-bleed image band(s) with scroll parallax and a caption placard beneath
 * each. Pass one or more figures; they render edge-to-edge in a row.
 */
export function MediaBand({
  images,
  alt = "",
  height = "h-[420px] md:h-[576px]",
  className,
}: {
  images: Figure[];
  alt?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid w-full bg-cream", className)} style={{ gridTemplateColumns: `repeat(${images.length}, minmax(0,1fr))` }}>
      {images.map((f, i) => (
        <div key={i}>
          <div className={cn("relative", height)}>
            <Parallax className="h-full w-full">
              <Img src={f.src} alt={alt || f.caption} className="h-full w-full" />
            </Parallax>
          </div>
          <FigCaption info={f.caption} relation={f.relation} className="px-[15px] md:px-[30px]" />
        </div>
      ))}
    </div>
  );
}
