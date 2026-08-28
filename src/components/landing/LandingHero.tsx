import { useEffect, useRef, useState } from "react";
import Picture from "@/components/Picture";
import { portrait } from "@/assets/optimized/manifest";
import { SITE } from "@/lib/site";
import { useSiteClock } from "@/lib/clock";
import { useMotionPolicy } from "@/lib/motion-policy";
import styles from "./LandingHero.module.css";

/** How long the cascade in LandingHero.module.css runs, end to end. */
const SEQUENCE_MS = 1750;

/**
 * The front door. An instrument powering on: the readout comes up, the
 * measuring field fades in, a scan pass resolves the portrait, then the name
 * opens out on the typeface's own width axis.
 *
 * The sequence is CSS (see the module file for why). This component owns only
 * *when* it is allowed to run:
 *
 *   - reduced motion  -> never runs; the hero mounts finished
 *   - any interaction -> ends immediately, on the first wheel, touch, key or
 *     pointer press. An intro that ignores the visitor is a toll booth.
 *   - otherwise       -> ends on its own after SEQUENCE_MS
 *
 * All three land on the same `data-intro="done"` state, so there is one
 * finished appearance rather than a per-path variant.
 */
export default function LandingHero() {
  const { enabled } = useMotionPolicy();
  const clock = useSiteClock();

  // Starts finished when motion is off, so there is no frame where a
  // reduced-motion visitor sees the pre-animation state.
  const [done, setDone] = useState(!enabled);
  const doneRef = useRef(done);
  doneRef.current = done;

  useEffect(() => {
    if (!enabled) {
      setDone(true);
      return;
    }

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setDone(true);
    };

    const timer = window.setTimeout(finish, SEQUENCE_MS);

    // `passive` on the scroll-adjacent ones: this only reads that an
    // interaction happened, it never prevents it.
    const opts = { passive: true } as const;
    window.addEventListener("wheel", finish, opts);
    window.addEventListener("touchstart", finish, opts);
    window.addEventListener("pointerdown", finish, opts);
    window.addEventListener("keydown", finish);
    window.addEventListener("scroll", finish, opts);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchstart", finish);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("scroll", finish);
    };
  }, [enabled]);

  return (
    <div
      className={`${styles.stage} relative flex min-h-[calc(100dvh-2.75rem)] items-center overflow-hidden pt-20 pb-16 lg:pt-24`}
      data-intro={done ? "done" : "running"}
    >
      <div className={`${styles.field} ${styles.step} ${styles.s1}`} aria-hidden="true" />

      <div className="container relative">
        <div className="grid items-center gap-10 sm:grid-cols-[minmax(0,auto)_minmax(0,1fr)] sm:gap-12 lg:gap-16">
          {/* The portrait, duotoned into the palette. Eager and high priority:
              on this route it is the largest contentful paint. */}
          <div
            className={`${styles.portraitFrame} ${styles.step} ${styles.s2} relative w-44 shrink-0 rounded-md border border-border sm:w-56 lg:w-[19rem]`}
          >
            <Picture
              image={portrait}
              alt="Umer Farooq"
              sizes="(min-width: 1024px) 304px, (min-width: 640px) 224px, 176px"
              className={`${styles.portrait} aspect-[3/4] h-auto w-full object-cover object-[50%_18%]`}
              priority
            />
            <span className={styles.scan} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className={`${styles.step} ${styles.s1} readout flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs uppercase tracking-widest text-muted-foreground`}>
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${clock.awake ? "bg-systems" : "bg-graphite"}`}
                />
                <span className="text-systems-type">Open to work</span>
              </span>
              <span aria-hidden="true" className="h-px w-4 bg-border" />
              <span>
                {clock.hh}:{clock.mm} {clock.label}
              </span>
            </p>

            <h1
              id="landing-name"
              className={`${styles.name} mt-5 font-display text-[clamp(2.75rem,1.5rem+7vw,6.5rem)] font-extrabold leading-[0.92] text-foreground`}
            >
              Umer Farooq
            </h1>

            <p className={`${styles.step} ${styles.s3} mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground`}>
              {SITE.tagline}
            </p>

            <p className={`${styles.step} ${styles.s4} label-mono mt-7 text-primary-type`}>
              {SITE.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
