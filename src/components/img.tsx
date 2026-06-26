import { cn } from "@/lib/utils";

/**
 * Plain object-cover image that fills its container. Wrap in a sized/positioned
 * element via `className`.
 */
export function Img({
  src,
  alt,
  className,
  imgClassName,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("block overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </span>
  );
}
