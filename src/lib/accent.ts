import type { DomainAccent } from "@/data/taxonomy";

/**
 * The accent rule, in one place.
 *
 *   thermal  — compute, GPU, HPC, and the single primary action per view
 *   cryo     — quantum and simulation
 *   neural   — AI, evaluation, and orchestration
 *   systems  — systems, distributed work, and verified states
 *   interface — full-stack products and applications
 *   award    — recognition only
 *   none     — intentionally neutral UI
 *
 * Text always uses the `-type` token (contrast-safe in both themes); the vivid
 * palette values are only ever fills, marks, and borders.
 */
export interface AccentClasses {
  /** Small pill or tag. */
  chip: string;
  /** Square icon holder. */
  icon: string;
  /** Persistent panel border + hover state. */
  panel: string;
  /** Eyebrow / label text. */
  label: string;
  /** Solid dot, bar, or rule. */
  mark: string;
  /** Large value or short emphasized phrase. */
  value: string;
  /** Selected control surface. */
  selected: string;
  /** Text color applied by a parent `group` hover. */
  hoverText: string;
}

export type VisualAccent = DomainAccent | "award";

export const ACCENTS: Record<VisualAccent, AccentClasses> = {
  thermal: {
    chip: "bg-thermal/10 text-primary-type border-thermal/25",
    icon: "bg-thermal/10 text-primary-type border-thermal/25",
    panel: "border-thermal/25 hover:border-thermal/55",
    label: "text-primary-type",
    mark: "bg-thermal",
    value: "text-primary-type",
    selected: "border-thermal bg-thermal/10",
    hoverText: "group-hover:text-primary-type",
  },
  cryo: {
    chip: "bg-cryo/10 text-cryo-type border-cryo/25",
    icon: "bg-cryo/10 text-cryo-type border-cryo/25",
    panel: "border-cryo/25 hover:border-cryo/55",
    label: "text-cryo-type",
    mark: "bg-cryo",
    value: "text-cryo-type",
    selected: "border-cryo bg-cryo/10",
    hoverText: "group-hover:text-cryo-type",
  },
  neural: {
    chip: "bg-neural/10 text-neural-type border-neural/25",
    icon: "bg-neural/10 text-neural-type border-neural/25",
    panel: "border-neural/25 hover:border-neural/55",
    label: "text-neural-type",
    mark: "bg-neural",
    value: "text-neural-type",
    selected: "border-neural bg-neural/10",
    hoverText: "group-hover:text-neural-type",
  },
  systems: {
    chip: "bg-systems/10 text-systems-type border-systems/25",
    icon: "bg-systems/10 text-systems-type border-systems/25",
    panel: "border-systems/25 hover:border-systems/55",
    label: "text-systems-type",
    mark: "bg-systems",
    value: "text-systems-type",
    selected: "border-systems bg-systems/10",
    hoverText: "group-hover:text-systems-type",
  },
  interface: {
    chip: "bg-interface/10 text-interface-type border-interface/25",
    icon: "bg-interface/10 text-interface-type border-interface/25",
    panel: "border-interface/25 hover:border-interface/55",
    label: "text-interface-type",
    mark: "bg-interface",
    value: "text-interface-type",
    selected: "border-interface bg-interface/10",
    hoverText: "group-hover:text-interface-type",
  },
  award: {
    chip: "bg-award/10 text-award-type border-award/25",
    icon: "bg-award/10 text-award-type border-award/25",
    panel: "border-award/25 hover:border-award/55",
    label: "text-award-type",
    mark: "bg-award",
    value: "text-award-type",
    selected: "border-award bg-award/10",
    hoverText: "group-hover:text-award-type",
  },
  none: {
    chip: "bg-muted text-foreground border-border",
    icon: "bg-muted text-foreground border-border",
    panel: "hover:border-foreground/30",
    label: "text-muted-foreground",
    mark: "bg-graphite",
    value: "text-foreground",
    selected: "border-foreground/30 bg-muted/60",
    hoverText: "group-hover:text-foreground",
  },
};

export function accent(kind: VisualAccent): AccentClasses {
  return ACCENTS[kind];
}

/**
 * The raw hue for an accent, as a CSS variable reference.
 *
 * Everything above hands back Tailwind class names, which covers the cases the
 * design system anticipated. This is the escape hatch for the ones it did not:
 * a custom property fed to a CSS module, where the value has to be a colour
 * rather than a class. It resolves to the *vivid* token, so it belongs in
 * fills, washes, rules and shadows, never in text (use `accent().value` there,
 * which is the contrast-safe pair).
 *
 * Kept beside ACCENTS so the two cannot drift.
 */
const ACCENT_VARS: Record<VisualAccent, string> = {
  thermal: "var(--color-thermal)",
  cryo: "var(--color-cryo)",
  neural: "var(--color-neural)",
  systems: "var(--color-systems)",
  interface: "var(--color-interface)",
  award: "var(--color-award)",
  none: "var(--color-graphite)",
};

export function accentVar(kind: VisualAccent): string {
  return ACCENT_VARS[kind];
}
