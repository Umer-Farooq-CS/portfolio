import type { DomainAccent } from "@/data/taxonomy";

/**
 * The accent rule, in one place.
 *
 *   thermal — compute, GPU, HPC, and the single primary action per view
 *   cryo    — quantum and simulation
 *   none    — everything else, AI included
 *
 * AI content is deliberately unaccented: it's the loudest thing on most
 * engineering portfolios, so here it's the quietest.
 *
 * Text always uses the `-type` token (contrast-safe in both themes); the vivid
 * `thermal`/`cryo` values are only ever fills, marks, and borders.
 */
export interface AccentClasses {
  /** Small pill or tag. */
  chip: string;
  /** Square icon holder. */
  icon: string;
  /** Panel border + hover state. */
  panel: string;
  /** Eyebrow / label text. */
  label: string;
}

export const ACCENTS: Record<DomainAccent, AccentClasses> = {
  thermal: {
    chip: "bg-thermal/10 text-primary-type border-thermal/25",
    icon: "bg-thermal/10 text-primary-type border-thermal/25",
    panel: "border-thermal/25 hover:border-thermal/50",
    label: "text-primary-type",
  },
  cryo: {
    chip: "bg-cryo/10 text-accent-type border-cryo/25",
    icon: "bg-cryo/10 text-accent-type border-cryo/25",
    panel: "border-cryo/25 hover:border-cryo/50",
    label: "text-accent-type",
  },
  none: {
    chip: "bg-muted text-foreground border-border",
    icon: "bg-muted text-foreground border-border",
    panel: "border-border hover:border-foreground/30",
    label: "text-muted-foreground",
  },
};

export function accent(kind: DomainAccent): AccentClasses {
  return ACCENTS[kind];
}
