import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import JsonLd from "@/components/JsonLd";
import LandingHero from "@/components/landing/LandingHero";
import { Metric, MonoLabel } from "@/components/kit/Primitives";
import { DOMAINS } from "@/data/taxonomy";
import { PROJECTS } from "@/data/projects";
import { PROFILES } from "@/data/profiles";
import { routeMeta } from "@/data/routeMeta";
import { accent } from "@/lib/accent";
import { useDocumentMeta } from "@/lib/meta";
import { useMotionPolicy } from "@/lib/motion-policy";
import { getStoredProfileId } from "@/lib/profile";
import { personSchema } from "@/lib/seo";

/**
 * The root of the site, in two beats.
 *
 * Beat one is the hero: who this is, stated once, with the boot sequence in
 * LandingHero. Beat two is the choice. The hero is `position: sticky` and the
 * choice panel is its next sibling, so scrolling slides the panel up over a
 * hero that stays put. That is the whole transition: no scroll listener, no
 * animation library, no pinning plugin. `overflow-x: clip` on the shell (rather
 * than `hidden`) is what keeps sticky resolving against the viewport.
 *
 * The hero stops one notch short of full height on purpose. The panel's top
 * edge and its thermal rule sit just inside the fold, which teaches the scroll
 * without printing the word "scroll" on the page.
 *
 * The proof band under the choice is this page's version of ProofChapter's
 * "numbers, not assertions": the fastest way to show the three lenses share one
 * body of work is to put the same count under all three, in the open.
 */
export default function ProfileSelectorPage() {
  const { enabled, reveal } = useMotionPolicy();
  useDocumentMeta({ ...routeMeta("/"), path: "/" });

  const storedId = getStoredProfileId();
  const storedProfile = storedId ? PROFILES.find((p) => p.id === storedId) : undefined;

  const rise = (delay: number) => ({
    initial: enabled ? { opacity: 0, y: 14 } : false,
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: reveal.section, delay: enabled ? delay : 0, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <>
      <JsonLd id="person-selector" data={personSchema()} />

      <div className="relative">
        <section className="sticky top-0 z-0" aria-labelledby="landing-name">
          <LandingHero />
        </section>

        {/* Rides up over the pinned hero. The background is opaque and the top
            rule is thermal, so the leading edge reads as a panel arriving
            rather than as content bleeding through. */}
        <section
          id="choose"
          aria-labelledby="choose-heading"
          className="relative z-10 border-t-2 border-thermal bg-background pb-20 pt-14 shadow-[0_-18px_40px_rgba(11,13,16,0.09)] dark:shadow-[0_-24px_56px_rgba(0,0,0,0.5)] lg:pt-16"
        >
          <div className="container max-w-4xl">
            <motion.div {...rise(0)}>
              <MonoLabel className="text-primary-type">Choose a lens</MonoLabel>
              <h2
                id="choose-heading"
                className="mt-4 text-3xl text-foreground [font-variation-settings:'wdth'_112] [text-wrap:balance]"
              >
                One body of work, read three ways.
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Same projects, same experience, same skills. Pick the one that matches why
                you&apos;re here. You can switch at any point without losing your place.
              </p>
            </motion.div>

            {storedProfile && (
              <motion.div {...rise(0.06)} className="mt-9">
                <Link
                  to={`/${storedProfile.path}`}
                  className={`pressable group inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2.5 font-mono text-2xs uppercase tracking-widest transition-[color,border-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${accent(storedProfile.accent).panel} ${accent(storedProfile.accent).value}`}
                >
                  Continue as {storedProfile.navLabel}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </motion.div>
            )}

            <motion.div {...rise(0.1)} className="mt-9">
              {/* Mobile: compact rows — three full cards here would be a lot of
                  scroll for one decision. */}
              <ul className="flex flex-col sm:hidden">
                {PROFILES.map((profile) => {
                  const tone = accent(profile.accent);
                  return (
                    <li key={profile.id} className="border-t border-border first:border-t-0">
                      <Link
                        to={`/${profile.path}`}
                        className="pressable-panel group flex min-h-11 items-center justify-between gap-3 py-4 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${tone.mark}`} />
                            <span className={`label-mono ${tone.label}`}>{profile.navLabel}</span>
                          </span>
                          <span className={`mt-1.5 block text-base font-semibold ${tone.value}`}>{profile.fullLabel}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                            {profile.selectorBlurb}
                          </span>
                        </span>
                        <ArrowRight
                          size={16}
                          className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${tone.value}`}
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Desktop / tablet: three cards, room for the blurb to breathe. */}
              <div className="hidden gap-4 sm:grid sm:grid-cols-3">
                {PROFILES.map((profile, index) => {
                  const tone = accent(profile.accent);
                  return (
                    <motion.div
                      key={profile.id}
                      initial={enabled ? { opacity: 0, y: 16 } : false}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: reveal.element, delay: enabled ? 0.12 + index * reveal.stagger : 0 }}
                    >
                      <Link
                        to={`/${profile.path}`}
                        className={`pressable-panel group flex h-full flex-col rounded-lg border p-5 transition-[background-color,border-color,transform] hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.panel}`}
                      >
                        <span className="flex items-center gap-2">
                          <span aria-hidden="true" className={`h-px w-5 ${tone.mark}`} />
                          <span className={`label-mono ${tone.label}`}>{profile.navLabel}</span>
                        </span>
                        <span className={`mt-3 block text-lg font-semibold leading-snug ${tone.value}`}>
                          {profile.fullLabel}
                        </span>
                        <span className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                          {profile.selectorBlurb}
                        </span>
                        <span
                          className={`mt-auto flex items-center gap-1.5 pt-5 font-mono text-2xs uppercase tracking-widest ${tone.value}`}
                        >
                          Enter
                          <ArrowRight
                            size={13}
                            className="transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* The proof that these are three lenses on one body of work, not
                three portfolios. */}
            <motion.dl
              {...rise(0.16)}
              className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8 sm:max-w-xl"
            >
              <Metric value={String(PROJECTS.length)} label="Projects" note="one shared set" />
              <Metric value={String(DOMAINS.length)} label="Technical domains" note="infrastructure to full-stack" />
              <Metric value="3" label="Lenses" note="same evidence, every time" />
            </motion.dl>
          </div>
        </section>
      </div>
    </>
  );
}
