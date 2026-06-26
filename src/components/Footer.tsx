import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { FOOTER_STATEMENT, FOOTER_COLUMNS, ORG } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="w-full bg-cream px-[15px] pb-[28px] pt-[80px] md:px-[30px] md:pt-[120px]">
      <Reveal className="grid grid-cols-12 gap-y-[48px]">
        <div className="col-span-12 md:col-span-5">
          <Link
            href={FOOTER_STATEMENT.href}
            className="group inline-flex items-start gap-[12px] text-[28px] leading-[1.2] tracking-[-0.3px] text-ink transition-opacity duration-300 hover:opacity-70 md:text-[36px]"
          >
            <span className="max-w-[340px]">{FOOTER_STATEMENT.label}</span>
            <ArrowIcon className="mt-[8px] h-[20px] w-[20px] flex-shrink-0" />
          </Link>
        </div>

        <div className="col-span-12 grid grid-cols-2 gap-[20px] sm:grid-cols-3 md:col-span-7">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">{column.heading}</h3>
              <div className="mt-[16px] flex flex-col gap-[8px]">
                {column.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] leading-[1.4] text-ink transition-opacity duration-300 hover:opacity-60 md:text-[14px]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-[13px] leading-[1.4] text-ink transition-opacity duration-300 hover:opacity-60 md:text-[14px]"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-[64px] border-t border-clay pt-[20px] md:mt-[120px]">
        <div className="flex flex-col gap-[10px] md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-smoke">
            All public claims traceable to source · © 2026 {ORG.short} · Build 2026.06
          </p>
          <a
            href={`mailto:${ORG.email}`}
            className="text-[13px] text-smoke transition-opacity duration-300 hover:opacity-60 md:text-[14px]"
          >
            {ORG.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
