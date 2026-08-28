import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import JsonLd from "@/components/JsonLd";
import { AccentText, Metric, MonoLabel } from "@/components/kit/Primitives";
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
 * The root of the site. Not a settings dialog — the same visual language as
 * every chapter, just introducing the choice instead of the work. The proof
 * band at the bottom is this page's version of ProofChapter's "numbers, not
 * assertions": the fastest way to show the three lenses share one body of
 * work is to put the same count under all three, in the open.
 */
export default function ProfileSelectorPage() {
  const { enabled, reveal } = useMotionPolicy();
  useDocumentMeta({ ...routeMeta("/"), path: "/" });

  const storedId = getStoredProfileId();
  const storedProfile = storedId ? PROFILES.find((p) => p.id === storedId) : undefined;

  const rise = (delay: number) => ({
    initial: enabled ? { opacity: 0, y: 14 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: reveal.section, delay: enabled ? delay : 0, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center py-16 lg:min-h-[calc(100vh-4rem)]">
      <JsonLd id="person-selector" data={personSchema()} />
      <div className="container max-w-4xl">
        <motion.div {...rise(0)}>
          <MonoLabel className="text-primary-type">Umer Farooq</MonoLabel>
          <h1 className="mt-4 text-display text-foreground [font-variation-settings:'wdth'_118] [text-wrap:balance]">
            One body of work — read <AccentText tone="thermal">three ways</AccentText>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Same projects, same experience, same skills. Pick the lens that matches why you&apos;re
            here — you can switch at any point without losing your place.
          </p>
        </motion.div>

        {storedProfile && (
          <motion.div {...rise(0.1)} className="mt-10">
            <Link
              to={`/${storedProfile.path}`}
              className={`group inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2.5 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${accent(storedProfile.accent).panel} ${accent(storedProfile.accent).value}`}
            >
              Continue as {storedProfile.navLabel}
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </motion.div>
        )}

        <motion.div {...rise(0.16)} className="mt-8 border-t border-border pt-2">
          <MonoLabel className="pt-6">View my work as</MonoLabel>

          {/* Mobile: compact rows — three full cards here would be a lot of scroll for one decision. */}
          <ul className="mt-4 flex flex-col sm:hidden">
            {PROFILES.map((profile) => {
              const tone = accent(profile.accent);
              return (
                <li key={profile.id} className="border-t border-border first:border-t-0">
                  <Link
                    to={`/${profile.path}`}
                    className="group flex min-h-11 items-center justify-between gap-3 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <div className="mt-4 hidden gap-4 sm:grid sm:grid-cols-3">
            {PROFILES.map((profile, index) => {
              const tone = accent(profile.accent);
              return (
                <motion.div
                  key={profile.id}
                  initial={enabled ? { opacity: 0, y: 16 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reveal.element, delay: enabled ? 0.2 + index * reveal.stagger : 0 }}
                >
                  <Link
                    to={`/${profile.path}`}
                    className={`group flex h-full flex-col rounded-lg border p-5 transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.panel}`}
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

        {/* The proof that these are the same three lenses on one body of work, not three portfolios. */}
        <motion.dl
          {...rise(0.3)}
          className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8 sm:max-w-xl"
        >
          <Metric value={String(PROJECTS.length)} label="Projects" note="one shared set" />
          <Metric value={String(DOMAINS.length)} label="Technical domains" note="infrastructure to full-stack" />
          <Metric value="3" label="Lenses" note="same evidence, every time" />
        </motion.dl>
      </div>
    </div>
  );
}
