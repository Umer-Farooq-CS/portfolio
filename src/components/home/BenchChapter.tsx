import { motion } from "motion/react";
import SpeedupBench from "@/components/bench/SpeedupBench";
import { AccentText, PrimaryAction, QuietAction } from "@/components/kit/Primitives";
import { accent } from "@/lib/accent";
import { useIslamabadClock } from "@/lib/clock";
import { useMotionPolicy } from "@/lib/motion-policy";
import type { ProfileHeroPart, ProfileHeroSignal } from "@/data/profiles";

/**
 * Chapter 01. The hero doesn't claim the skill — it runs a parallel workload on
 * the visitor's machine and plots the result. Everything else here is quiet so
 * that instrument is the thing you remember.
 *
 * Headline, subhead, and signals come from the active profile — same identity,
 * different positioning. Everything below the hero (the bench itself) is
 * shared across every lens.
 */
export default function BenchChapter({
  headline,
  subhead,
  signals,
  worksHref,
}: {
  headline: ProfileHeroPart[];
  subhead: string;
  signals: ProfileHeroSignal[];
  worksHref: string;
}) {
  const { enabled, reveal } = useMotionPolicy();
  const clock = useIslamabadClock();

  const rise = (delay: number) => ({
    initial: enabled ? { opacity: 0, y: 14 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: reveal.section, delay: enabled ? delay : 0, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section id="bench" className="scroll-mt-20 pb-20 pt-28 lg:pb-28 lg:pt-36">
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div>
            <motion.div {...rise(0)} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-systems" aria-hidden="true" />
                <span className="label-mono">Open to work</span>
              </span>
              <span aria-hidden="true" className="h-px w-4 bg-border" />
              <span className="readout text-2xs uppercase tracking-widest text-muted-foreground">
                Islamabad · {clock.hh}:{clock.mm} {clock.label}
              </span>
            </motion.div>

            <motion.h1
              {...rise(0.08)}
              className="mt-6 text-display text-foreground [font-variation-settings:'wdth'_118] [text-wrap:balance]"
            >
              {headline.map((part, index) =>
                part.tone ? (
                  <AccentText key={index} tone={part.tone}>
                    {part.text}
                  </AccentText>
                ) : (
                  <span key={index}>{part.text}</span>
                ),
              )}
            </motion.h1>

            <motion.p {...rise(0.16)} className="mt-6 max-w-xl text-lg text-muted-foreground">
              {subhead}
            </motion.p>

            <motion.ul
              {...rise(0.22)}
              aria-label="Technical domains"
              className="mt-7 grid max-w-2xl grid-cols-2 gap-x-5 gap-y-3 border-y border-border py-4 sm:grid-cols-4"
            >
              {signals.map((signal) => {
                const tone = accent(signal.tone);
                return (
                  <li key={signal.label} className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${tone.mark}`} />
                      <span className={`label-mono ${tone.value}`}>{signal.label}</span>
                    </span>
                    <span className="readout mt-1 block truncate text-2xs text-muted-foreground">
                      {signal.detail}
                    </span>
                  </li>
                );
              })}
            </motion.ul>

            <motion.div {...rise(0.3)} className="mt-9 flex flex-wrap items-center gap-3">
              <PrimaryAction to={worksHref}>See the work</PrimaryAction>
              <QuietAction href="#talk">Talk to me</QuietAction>
            </motion.div>
          </div>

          <motion.div {...rise(0.36)}>
            <SpeedupBench />
            <p className="mt-3 max-w-[38ch] text-xs leading-relaxed text-muted-foreground">
              That curve was measured here, in your browser, a moment ago. Making it bend the right
              way is the job.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
