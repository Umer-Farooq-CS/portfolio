import type { VisualAccent } from "@/lib/accent";
import type { HomeChapterKey } from "@/data/profiles";
import { stripProfilePrefix } from "@/lib/profile";

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
  tone: VisualAccent;
}

/** One entry per home chapter, keyed the same way profiles.ts orders them. */
export const CHAPTER_SECTIONS: Record<HomeChapterKey, SectionEntry> = {
  bench: { id: "bench", label: "Bench", tone: "thermal" },
  techLogos: { id: "tech-logos", label: "Stack", tone: "interface" },
  work: { id: "work", label: "Work", tone: "interface" },
  proof: { id: "proof", label: "Proof", tone: "systems" },
  activity: { id: "activity", label: "Live", tone: "cryo" },
  about: { id: "about", label: "About", tone: "systems" },
  talk: { id: "talk", label: "Talk", tone: "neural" },
};

/**
 * The rail only makes sense on a profile's home chapter — everywhere else
 * (including "/", the profile selector) it renders nothing. `homeChapterOrder`
 * comes from the active profile, so the index always matches what's actually
 * on the page in that lens.
 */
export function sectionsForRoute(pathname: string, homeChapterOrder?: HomeChapterKey[]): SectionEntry[] {
  // "/" itself is the profile selector, never a chapter page, even though
  // stripping a (nonexistent) prefix from it would also yield "/".
  if (pathname === "/" || !homeChapterOrder) return [];
  if (stripProfilePrefix(pathname) !== "/") return [];
  // TechLogoRail has no numbered chapter header of its own — it's a strip
  // between chapters, not a stop in the sequence the rail counts.
  return homeChapterOrder.filter((key) => key !== "techLogos").map((key) => CHAPTER_SECTIONS[key]);
}

/** Two-digit index, so the rail reads like a channel list. */
export function sectionIndex(position: number): string {
  return String(position + 1).padStart(2, "0");
}
