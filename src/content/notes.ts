import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { FieldNote } from "./types";

// Field notes live in a JSON content store (content/notes/*.json) so the daily
// FCRI loop can write them. Each carries a `published` flag (drafts are hidden
// from the public site). Import this DIRECTLY from server components only.
export interface StoredNote extends FieldNote {
  published?: boolean;
}

export const NOTES_INTRO = {
  label: "Field Notes",
  heading: "Field notes.",
  body: "Short, regular readings of current events through a research lens: what happened, the question a researcher would ask, and what the evidence can and cannot say. They are AI-assisted and move quickly. They are not peer reviewed and they are not investment advice; the vetted work lives in Papers.",
};

const NOTES_DIR = join(process.cwd(), "content", "notes");

function loadStoredNotes(): StoredNote[] {
  let files: string[] = [];
  try {
    files = readdirSync(NOTES_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const notes = files.map((f) => JSON.parse(readFileSync(join(NOTES_DIR, f), "utf8")) as StoredNote);
  // Newest first (notes use ISO dates).
  notes.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.slug.localeCompare(b.slug));
  return notes;
}

/** Every note in the store, including drafts (used by tooling). */
export const ALL_NOTES: StoredNote[] = loadStoredNotes();

/** Public notes (published only). */
export const NOTES: FieldNote[] = ALL_NOTES.filter((n) => n.published !== false);

export function getNote(slug: string): FieldNote | undefined {
  return NOTES.find((n) => n.slug === slug);
}
