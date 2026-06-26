import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { ArrowIcon } from "@/components/icons";
import { NOTES, NOTES_INTRO } from "@/content/notes";

export const metadata = { title: "Field Notes" };

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function NotesPage() {
  return (
    <PageShell eyebrow={NOTES_INTRO.label} title={NOTES_INTRO.heading} intro={NOTES_INTRO.body}>
      <Reveal as="section" stagger className="px-[15px] pb-[80px] md:px-[30px] md:pb-[120px]">
        {NOTES.length === 0 && (
          <p className="border-t border-clay py-[28px] text-[15px] text-smoke">No field notes yet.</p>
        )}
        {NOTES.map((n) => (
          <Link
            key={n.slug}
            href={`/notes/${n.slug}`}
            className="group block border-t border-clay py-[28px] transition-opacity duration-300 last:border-b hover:opacity-70 md:py-[34px]"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
              Field note · {fmtDate(n.date)}
            </p>
            <h2 className="mt-[10px] max-w-[760px] text-[24px] leading-[1.12] tracking-[-0.4px] text-ink md:text-[30px]">
              {n.title}
            </h2>
            <p className="mt-[10px] max-w-[640px] text-[15px] leading-[1.45] text-smoke">{n.dek}</p>
            {n.tags && n.tags.length > 0 && (
              <p className="mt-[12px] font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">
                {n.tags.join(" · ")}
              </p>
            )}
            <span className="mt-[14px] inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.04em] text-ink">
              Read the note <ArrowIcon className="h-[14px] w-[14px]" />
            </span>
          </Link>
        ))}
      </Reveal>
    </PageShell>
  );
}
