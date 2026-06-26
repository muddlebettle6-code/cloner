import { cn } from "@/lib/utils";

type IconProps = React.SVGProps<SVGSVGElement>;

export function ArrowIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("block", className)} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("block", className)} {...props}>
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1" />
      <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function MinusIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("block", className)} {...props}>
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1" />
      <path d="M7 12h10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Cumulant logo mark — a probability distribution curve over a baseline (the
 * "norm"/average) with a single marked point out in the right tail: research
 * "beyond the norm". Inherits currentColor so it flips with the header.
 */
export function CumulantMark({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 30 24" fill="none" className={cn("block", className)} aria-hidden="true" {...props}>
      <path d="M2.5 18.6H27.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.35" />
      <path
        d="M3.5 18.6C8.6 18.6 10 5.6 15 5.6C20 5.6 21.4 18.6 26.5 18.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23.4" cy="15" r="1.7" fill="currentColor" />
    </svg>
  );
}

export function CloseIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("block", className)} {...props}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PlayIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("block", className)} {...props}>
      <circle cx="12" cy="12" r="11.25" stroke="currentColor" strokeWidth="1" />
      <path d="M10 8.5l6 3.5-6 3.5v-7z" fill="currentColor" />
    </svg>
  );
}

export function MenuIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("block", className)} {...props}>
      <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
