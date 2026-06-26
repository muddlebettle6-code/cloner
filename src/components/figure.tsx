import { Img } from "@/components/img";
import { cn } from "@/lib/utils";

/**
 * Museum-style placard caption, shown BELOW the image/video as small text:
 * an info line (what it is) + a short line on how it relates to Cumulant.
 */
export function FigCaption({
  info,
  relation,
  className,
}: {
  info: string;
  relation?: string;
  className?: string;
}) {
  return (
    <figcaption className={cn("mt-[10px]", className)}>
      <span className="font-mono text-[11px] uppercase leading-[1.4] tracking-[0.04em] text-ink">{info}</span>
      {relation && <span className="mt-[3px] block text-[12px] leading-[1.45] text-[#5f5f5f]">{relation}</span>}
    </figcaption>
  );
}

/**
 * Image with a caption placard beneath it. `className` sizes the image box.
 */
export function Figure({
  src,
  caption,
  relation,
  alt,
  className,
  imgClassName,
  captionClassName,
  priority,
}: {
  src: string;
  caption: string;
  relation?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  captionClassName?: string;
  priority?: boolean;
}) {
  return (
    <figure>
      <div className={cn("relative overflow-hidden", className)}>
        <Img src={src} alt={alt} className="h-full w-full" imgClassName={imgClassName} priority={priority} />
      </div>
      <FigCaption info={caption} relation={relation} className={captionClassName} />
    </figure>
  );
}
