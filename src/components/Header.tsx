"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV, ORG } from "@/lib/site-data";
import { MenuIcon, CloseIcon, CumulantMark } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

/** Wordmark — custom distribution mark + Cumulant text (inherits currentColor). */
function Wordmark() {
  return (
    <span className="inline-flex items-center gap-[9px]">
      <CumulantMark className="h-[16px] w-[20px]" />
      <span className="font-sans text-[17px] font-medium leading-none tracking-[-0.02em]">{ORG.short}</span>
    </span>
  );
}

/**
 * Fixed header. On the homepage (`solid={false}`) the text flips white→ink on
 * scroll and a dot marks the active section. On dedicated pages (`solid`) the
 * header is always dark on cream with a hairline border. Items animate in on load.
 */
export function Header({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  const darkText = solid || scrolled;
  const norm = (s: string) => (s !== "/" ? s.replace(/\/+$/, "") : "/");
  const here = norm(pathname || "/");
  const isActive = (route: string) => {
    const r = norm(route);
    return r !== "/" && (here === r || here.startsWith(r + "/"));
  };

  return (
    <>
      <header
        className={cn(
          "fixed left-0 top-0 z-50 h-[60px] w-full transition-colors duration-500 ease-[var(--ease-standard)]",
          darkText ? "text-ink" : "text-white",
          solid ? "border-b border-clay bg-cream" : scrolled ? "bg-cream" : "bg-transparent"
        )}
      >
        <div className="flex h-full w-full items-center justify-between px-[15px] md:px-[30px]">
          <Link href="/" aria-label={ORG.name} className="enter transition-opacity duration-300 hover:opacity-70" style={{ animationDelay: "0ms" }}>
            <Wordmark />
          </Link>

          {/* Right: desktop nav + theme toggle + mobile menu trigger */}
          <div className="enter flex items-center gap-[18px] md:gap-[24px]" style={{ animationDelay: "120ms" }}>
            <nav className="hidden items-center gap-[24px] md:flex lg:gap-[28px]">
              {NAV.map((item) => (
                <Link
                  key={item.target}
                  href={item.route}
                  className="flex flex-col items-center transition-opacity duration-300 hover:opacity-70"
                >
                  <span className="whitespace-nowrap text-[13px] uppercase leading-none tracking-[-0.01em]">{item.label}</span>
                  <span
                    className={cn(
                      "mt-[4px] h-[3px] w-[3px] rounded-full bg-current transition-opacity duration-300",
                      isActive(item.route) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Link>
              ))}
            </nav>

            <ThemeToggle className="-mr-[5px]" />

            <button className="md:hidden" aria-label="open menu" onClick={() => setMenuOpen(true)}>
              <MenuIcon className="h-[22px] w-[22px] text-current" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-cream p-[20px] text-ink">
          <button className="self-end" aria-label="close menu" onClick={() => setMenuOpen(false)}>
            <CloseIcon className="h-[24px] w-[24px] text-current" />
          </button>

          <nav className="mt-[40px] flex flex-1 flex-col gap-[20px]">
            {NAV.map((item) => (
              <Link
                key={item.target}
                href={item.route}
                onClick={() => setMenuOpen(false)}
                className="text-left text-[28px] leading-none"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-between">
            <a
              href={`mailto:${ORG.email}`}
              className="font-mono text-[12px] uppercase tracking-[0.04em] text-smoke"
            >
              {ORG.email}
            </a>
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
  );
}
