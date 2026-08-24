// The writing section's content model.
//
// Nothing is published yet, so NOTES holds only a draft: it keeps the filter and
// the lookup honest code paths rather than untested ones, and it records what the
// first note is actually about. Drafts never reach the page.
//
// NOTES_ARE_PUBLIC gates the nav link — /notes stays reachable by URL, but it does
// not advertise itself as a section with nothing in it.

import { z } from "zod";

export interface Note {
  slug: string;
  title: string;
  summary: string;
  /** ISO date, `YYYY-MM-DD`. Publication date for published notes, target for drafts. */
  date: string;
  tags: string[];
  readingMinutes: number;
  draft?: boolean;
}

export const NOTES: Note[] = [
  {
    slug: "karp-flatt-on-a-laptop",
    title: "The serial fraction your laptop admits to",
    summary:
      "Measured speedup on 1–8 workers, then Karp–Flatt on the result. The gap from the ideal line is scheduling, shared cache, and hyperthreads that aren't whole cores — not mystery overhead.",
    date: "2026-09-15",
    tags: ["parallel", "benchmarking"],
    readingMinutes: 7,
    draft: true,
  },
];

/** Published notes, newest first. Drafts are excluded everywhere, including here. */
export function getPublishedNotes(): Note[] {
  return NOTES.filter((note) => note.draft !== true).sort((a, b) => b.date.localeCompare(a.date));
}

/** Looks up a published note. A draft slug resolves to nothing, same as a typo. */
export function getNoteBySlug(slug: string): Note | undefined {
  return getPublishedNotes().find((note) => note.slug === slug);
}

/**
 * Whether the nav should show /notes at all. The nav reads this instead of keeping
 * its own copy of the answer, so the link appears the moment a note ships.
 */
export const NOTES_ARE_PUBLIC: boolean = getPublishedNotes().length > 0;

// --- schema ----------------------------------------------------------------

const nonEmpty = z.string().trim().min(1);

export const noteSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  title: nonEmpty,
  summary: nonEmpty,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  tags: z.array(nonEmpty).min(1),
  readingMinutes: z.number().int().positive(),
  draft: z.boolean().optional(),
});
