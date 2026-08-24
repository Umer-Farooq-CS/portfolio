/**
 * The section index shown in the rail, per route.
 *
 * These are numbered because the homepage genuinely reads as a sequence — you
 * arrive at the instrument, see the work, check the proof, then get in touch.
 * Routes whose content isn't a sequence get no numbers.
 */
export interface SectionEntry {
  id: string;
  label: string;
}

export const HOME_SECTIONS: SectionEntry[] = [
  { id: "bench", label: "Bench" },
  { id: "work", label: "Work" },
  { id: "proof", label: "Proof" },
  { id: "about", label: "About" },
  { id: "talk", label: "Talk" },
];

export const ROUTE_SECTIONS: Record<string, SectionEntry[]> = {
  "/": HOME_SECTIONS,
};

export function sectionsForRoute(pathname: string): SectionEntry[] {
  return ROUTE_SECTIONS[pathname] ?? [];
}

/** Two-digit index, so the rail reads like a channel list. */
export function sectionIndex(position: number): string {
  return String(position + 1).padStart(2, "0");
}
