import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import JsonLd from "@/components/JsonLd";
import LandingHero from "@/components/landing/LandingHero";
import LensChoice from "@/components/landing/LensChoice";
import { useSectionHandoff } from "@/components/landing/useSectionHandoff";
import { PROFILES } from "@/data/profiles";
import { routeMeta } from "@/data/routeMeta";
import { accent } from "@/lib/accent";
import { useDocumentMeta } from "@/lib/meta";
import { useMotionPolicy } from "@/lib/motion-policy";
import { getStoredProfileId } from "@/lib/profile";
import { personSchema } from "@/lib/seo";

/**
 * The root of the site, in two screens.
 *
 * Beat one is the hero: who this is, and the size of the record. Beat two is
 * the choice, on a screen of its own.
 *
 * Two mechanics, both CSS:
 *
 * 1. The handoff. The hero is `position: sticky` and the choice panel is its
 *    next sibling, so scrolling slides the panel up over a hero that stays put.
 *    No scroll listener, no animation library, no pinning plugin. The shell's
 *    `overflow-x: clip` (rather than `hidden`) is what keeps sticky resolving
 *    against the viewport, so none of this touches AppShell.
 *
 * 2. One gesture, one screen, animated. The first scroll carries the reader
 *    across in a single eased travel: parking halfway, with the name and the
 *    cards each cut in half, is the worst frame of the transition. This is
 *    useSectionHandoff, and it is the only scripted scroll on the site. It acts
 *    across this one boundary and nowhere else, so everything past the choice
 *    scrolls normally.
 */
export default function ProfileSelectorPage() {
  const { enabled, reveal } = useMotionPolicy();
  useDocumentMeta({ ...routeMeta("/"), path: "/" });

  const storedId = getStoredProfileId();
  const storedProfile = storedId ? PROFILES.find((p) => p.id === storedId) : undefined;

  // One wheel notch anywhere on the first screen moves to the choice, and one
  // back up returns. See the hook for why CSS snap alone cannot do this.
  useSectionHandoff("choose", enabled);

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

        {/* Rides up over the pinned hero. Opaque background and a thermal top
            rule, so the leading edge reads as a panel arriving rather than as
            content bleeding through. */}
        <section
          id="choose"
          aria-labelledby="choose-heading"
          className="relative z-10 border-t-2 border-thermal bg-background shadow-[0_-18px_40px_rgba(11,13,16,0.09)] dark:shadow-[0_-24px_56px_rgba(0,0,0,0.5)]"
        >
          <LensChoice />

          {storedProfile && (
            <div className="container pb-16">
              <motion.div {...rise(0)} className="border-t border-border pt-7">
                <Link
                  to={`/${storedProfile.path}`}
                  className={`pressable group inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2.5 font-mono text-2xs uppercase tracking-widest transition-[color,border-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${accent(storedProfile.accent).panel} ${accent(storedProfile.accent).value}`}
                >
                  Or continue as {storedProfile.navLabel}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
