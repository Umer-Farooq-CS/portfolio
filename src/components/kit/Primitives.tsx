import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { sectionIndex } from "@/lib/sections";
import { accent, type VisualAccent } from "@/lib/accent";

/**
 * The small pieces the pages are assembled from. They exist so the type roles and
 * spacing rhythm are decided once, not re-improvised per section.
 */

/** Uppercase mono label — the site's utility voice. */
export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("label-mono", className)}>{children}</p>;
}

/** A bordered surface. One border weight everywhere, no nested elevation. */
export function Panel({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}) {
  return <Tag className={cn("rounded-lg border border-border bg-card", className)}>{children}</Tag>;
}

/**
 * A measurement: value in the data face, label under it. Optionally shows what it
 * improved on, because a number without a baseline isn't a result.
 *
 * Renders a real `dt`/`dd` pair, so it must live inside a `<dl>`. The label comes
 * first in the DOM, as the spec requires, and CSS order puts the value on top.
 */
export function Metric({
  value,
  label,
  baseline,
  note,
  tone = "none",
  className,
}: {
  value: string;
  label: string;
  baseline?: string;
  note?: string;
  tone?: VisualAccent;
  className?: string;
}) {
  const toneClasses = accent(tone);

  return (
    <div className={cn("flex flex-col", className)}>
      <dt className="label-mono order-2 mt-2">{label}</dt>
      <dd className="order-1">
        <span className={cn("readout block text-2xl leading-none sm:text-3xl", toneClasses.value)}>
          {value}
        </span>
      </dd>
      {baseline && (
        <dd className="readout order-3 mt-1 text-2xs text-muted-foreground">
          from {baseline}
          {note ? ` · ${note}` : ""}
        </dd>
      )}
      {!baseline && note && (
        <dd className="order-3 mt-1 text-2xs text-muted-foreground">{note}</dd>
      )}
    </div>
  );
}

/** Technology tag. Always mono: it names a tool, which is data, not prose. */
export function Tag({
  children,
  tone = "none",
}: {
  children: ReactNode;
  tone?: VisualAccent;
}) {
  const toneClasses = accent(tone);

  return (
    <span
      className={cn(
        "rounded-sm border px-1.5 py-0.5 font-mono text-2xs",
        tone === "none" ? "border-border bg-muted/60 text-muted-foreground" : toneClasses.chip,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Chapter heading. The number is real information here — the homepage is a
 * sequence — so it is shown, in the data face, at label size.
 */
export function ChapterHeader({
  index,
  eyebrow,
  title,
  lede,
  tone = "thermal",
  className,
  as: Heading = "h2",
}: {
  index?: number;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: VisualAccent;
  className?: string;
  /** "h1" when this is the page's own title; "h2" for a chapter within a page. */
  as?: "h1" | "h2";
}) {
  const toneClasses = accent(tone);

  return (
    <div className={cn("max-w-2xl", className)}>
      <div className="flex items-center gap-2.5">
        {index !== undefined && (
          <span className={cn("readout text-2xs", toneClasses.value)}>{sectionIndex(index)}</span>
        )}
        <span aria-hidden="true" className={cn("h-px w-6", toneClasses.mark)} />
        <MonoLabel className={toneClasses.label}>{eyebrow}</MonoLabel>
      </div>
      <Heading className="mt-4 text-3xl text-foreground">{title}</Heading>
      {lede && <p className="mt-4 text-base text-muted-foreground">{lede}</p>}
    </div>
  );
}

/** Short, semantic emphasis inside a heading or readout. */
export function AccentText({
  tone,
  children,
  className,
}: {
  tone: VisualAccent;
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn(accent(tone).value, className)}>{children}</span>;
}

/** The one primary action per view. */
export function PrimaryAction({
  to,
  href,
  children,
}: {
  to?: string;
  href?: string;
  children: ReactNode;
}) {
  const className =
    "group inline-flex items-center gap-2 rounded-md bg-thermal px-5 py-2.5 font-mono text-2xs uppercase tracking-widest text-on-thermal transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const content = (
    <>
      {children}
      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </>
  );
  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to ?? "/"} className={className}>
      {content}
    </Link>
  );
}

/** Everything that isn't the primary action. */
export function QuietAction({
  to,
  href,
  children,
  tone = "none",
  download,
}: {
  to?: string;
  href?: string;
  children: ReactNode;
  tone?: VisualAccent;
  download?: boolean | string;
}) {
  const toneClasses = accent(tone);
  const className = cn(
    "group inline-flex items-center gap-2 rounded-md border px-5 py-2.5 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    tone === "none"
      ? "border-border text-foreground hover:border-foreground/40"
      : `${toneClasses.panel} ${toneClasses.value}`,
  );
  const content = (
    <>
      {children}
      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </>
  );
  if (href) {
    return (
      <a href={href} className={className} download={download}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to ?? "/"} className={className}>
      {content}
    </Link>
  );
}

/** Inline text link that reads as a next step rather than a button. */
export function TextAction({
  to,
  children,
  tone = "thermal",
}: {
  to: string;
  children: ReactNode;
  tone?: VisualAccent;
}) {
  const toneClasses = accent(tone);

  return (
    <Link
      to={to}
      className={cn(
        "group inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        toneClasses.value,
      )}
    >
      {children}
      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

/** Hairline ticks that expose the column grid at a section seam. */
export function SectionSeam() {
  return <div aria-hidden="true" className="column-ticks h-2 w-full opacity-40" />;
}
