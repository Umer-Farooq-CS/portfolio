import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { sectionIndex } from "@/lib/sections";
import { accent, type VisualAccent } from "@/lib/accent";
import { useMotionPolicy } from "@/lib/motion-policy";
import { useCountUp } from "@/lib/useCountUp";

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
 *
 * The number counts up once when the metric scrolls into view — see
 * `useCountUp`. Every number on this site is something that was measured, and a
 * readout that converges on its reading is what an instrument does; it is not
 * decoration. At rest the DOM is a single text node holding `value` exactly.
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
  const { ref, running } = useCountUp(value);

  return (
    <div ref={ref} className={cn("flex flex-col", className)}>
      <dt className="label-mono order-2 mt-2">{label}</dt>
      <dd className="order-1">
        <span className={cn("readout block text-2xl leading-none sm:text-3xl", toneClasses.value)}>
          {running ? (
            <>
              {/*
                Layout shift: `.readout` is monospaced and `tabular-nums`, so
                every character advances by at most `1ch` (its slight negative
                tracking makes it a hair less, which only over-reserves) — but
                0 → 100 still grows from one glyph to three and would shove the
                suffix sideways mid-count. The digits therefore sit in an
                inline-block reserved at the *final* number's character count
                and right-aligned inside it. The count only ever goes up, so no
                intermediate frame can exceed that reservation: the suffix
                (`%`, `×`, ` min`) never moves, the box never reflows, and the
                number fills in from the right the way a right-aligned
                instrument display does.

                Screen readers: announcing sixty intermediate readings would be
                noise, and a value still converging is not what the visitor is
                being told. The animating digits are `aria-hidden` and the real
                value is carried by an `sr-only` sibling, so the accessible text
                is the measured value for the whole of the count and after it.
              */}
              <span aria-hidden="true">
                {running.prefix}
                <span className="inline-block text-right" style={{ minWidth: running.width }}>
                  {running.digits}
                </span>
                {running.suffix}
              </span>
              <span className="sr-only">{value}</span>
            </>
          ) : (
            value
          )}
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
  const { enabled, duration } = useMotionPolicy();

  return (
    <div className={cn("max-w-2xl", className)}>
      <div className="flex items-center gap-2.5">
        {index !== undefined && (
          <span className={cn("readout text-2xs", toneClasses.value)}>{sectionIndex(index)}</span>
        )}
        <motion.span
          aria-hidden="true"
          initial={enabled ? { scaleX: 0 } : false}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: duration(0.42), ease: [0.16, 1, 0.3, 1] }}
          className={cn("h-px w-6 origin-left", toneClasses.mark)}
        />
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
    "group inline-flex min-h-11 items-center gap-2 rounded-md bg-thermal px-5 py-2.5 font-mono text-2xs uppercase tracking-widest text-on-thermal transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
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
    "group inline-flex min-h-11 items-center gap-2 rounded-md border px-5 py-2.5 font-mono text-2xs uppercase tracking-widest transition-[color,border-color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
