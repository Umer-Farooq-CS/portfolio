import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { PROFILES } from "@/data/profiles";
import { accent, accentVar } from "@/lib/accent";
import { useMotionPolicy } from "@/lib/motion-policy";
import { MonoLabel } from "@/components/kit/Primitives";
import styles from "./LensChoice.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The second beat of the landing page, and the only thing on its own screen.
 *
 * The choice used to be three small tiles under a paragraph, which read as a
 * settings row: nothing about it said "this is the decision". Here the cards
 * are the screen.
 *
 * The entrance is gated on one `useInView` for the whole panel at `amount:
 * 0.55`, not on per-element `whileInView`. Per-element triggers fire the moment
 * each item crosses the viewport edge, which means the sequence plays *during*
 * the travel from the hero and is finished before the reader arrives. Waiting
 * until the panel is mostly on screen puts the staging where it can actually be
 * seen, and lets one timeline own the order.
 *
 * The hover behaviour is in the CSS module (`:has()` sibling dimming, accent
 * wash, the rule that draws across the top) because it is pointer state, and
 * pointer state in React means a re-render per frame.
 */
export default function LensChoice() {
  const { enabled, reveal } = useMotionPolicy();
  const panel = useRef<HTMLDivElement>(null);
  const arrived = useInView(panel, { once: true, amount: 0.55 });

  /** One timeline for the panel, so the order is readable in one place. */
  const step = (delay: number) => ({
    initial: enabled ? { opacity: 0, y: 22 } : false,
    animate: arrived || !enabled ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
    transition: { duration: reveal.section, delay: enabled ? delay : 0, ease: EASE },
  });

  return (
    <div
      ref={panel}
      className="container flex min-h-[100dvh] flex-col justify-center py-16 lg:py-20"
    >
      <div>
        <motion.div {...step(0)}>
          <MonoLabel className="text-primary-type">Choose how to read it</MonoLabel>
        </motion.div>

        <motion.h2
          {...step(0.1)}
          id="choose-heading"
          className="mt-4 max-w-3xl text-4xl text-foreground [font-variation-settings:'wdth'_114] [text-wrap:balance]"
        >
          One body of work, read three ways.
        </motion.h2>

        <motion.p {...step(0.2)} className="mt-4 max-w-xl text-base text-muted-foreground">
          Same projects, same experience, same skills. Pick one. You can switch at any point
          without losing your place.
        </motion.p>
      </div>

      <div className={`${styles.grid} mt-9 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5`} role="list">
        {PROFILES.map((profile, index) => {
          const tone = accent(profile.accent);
          return (
            <motion.div
              key={profile.id}
              role="listitem"
              initial={enabled ? { opacity: 0, y: 40, scale: 0.965 } : false}
              animate={
                arrived || !enabled
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 40, scale: 0.965 }
              }
              transition={{
                duration: 0.72,
                delay: enabled ? 0.32 + index * 0.12 : 0,
                ease: EASE,
              }}
            >
              <Link
                to={`/${profile.path}`}
                aria-label={`Enter as ${profile.fullLabel}`}
                className={`${styles.card} flex h-full min-h-[13.5rem] flex-col justify-between gap-8 rounded-lg border border-border bg-card p-6 focus-visible:outline-none md:min-h-[26rem] lg:min-h-[30rem] lg:p-7`}
                style={{ ["--lens-accent" as string]: accentVar(profile.accent) }}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`${styles.rank} readout text-2xs tracking-widest ${tone.label}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRight
                    size={20}
                    className={`${styles.arrow} shrink-0 ${tone.value}`}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <span className={`label-mono ${tone.label}`}>{profile.navLabel}</span>
                  <span
                    className={`mt-2.5 block font-display text-2xl font-semibold leading-[1.1] [font-variation-settings:'wdth'_106] lg:text-3xl ${tone.value}`}
                  >
                    {profile.fullLabel}
                  </span>
                  <span className="mt-3 block max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
                    {profile.selectorBlurb}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
