import { motion } from "motion/react";
import { portrait } from "@/assets/optimized/manifest";
import Picture from "@/components/Picture";
import { EDUCATION } from "@/data/profile";
import { ChapterHeader, MonoLabel, TextAction } from "@/components/kit/Primitives";
import { useMotionPolicy } from "@/lib/motion-policy";

/**
 * Chapter 04. The quiet one: a narrow measured column. After three chapters of
 * data, this is where the page slows down and a person shows up.
 *
 * "In compute / off compute" replaces the usual hobbies card — same information,
 * without pretending a table-tennis habit is a professional credential.
 */
export default function AboutChapter() {
  const { enabled, duration } = useMotionPolicy();

  return (
    <section id="about" className="scroll-mt-20 border-t border-border py-20 lg:py-28">
      <div className="container">
        <ChapterHeader
          index={3}
          eyebrow="Who's behind this"
          title="A systems person, in Islamabad"
        />

        <motion.div
          initial={enabled ? { opacity: 0, y: 16 } : { opacity: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: duration(0.6) }}
          className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,14rem)_minmax(0,34rem)] lg:gap-16"
        >
          <div className="max-w-[14rem]">
            <div className="overflow-hidden rounded-lg border border-border">
              <Picture
                image={portrait}
                alt="Portrait of Umer Farooq"
                sizes="(min-width: 1024px) 224px, 60vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <dl className="mt-5 flex flex-col gap-3">
              <div>
                <dt className="label-mono">Studying</dt>
                <dd className="mt-1 text-xs leading-relaxed text-foreground">
                  {EDUCATION.degree}
                  <span className="block text-muted-foreground">FAST-NUCES, Islamabad</span>
                </dd>
              </div>
              <div>
                <dt className="label-mono">Until</dt>
                <dd className="readout mt-1 text-xs text-foreground">Jun 2026</dd>
              </div>
            </dl>
          </div>

          <div>
            <p className="text-lg leading-relaxed text-foreground">
              I like problems where the answer is a number that has to go down. Most of my work sits
              between hardware and the thing on top of it — CUDA kernels, MPI ranks, quantum
              simulators, and the web platforms that make any of it usable by someone who isn't me.
            </p>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              I started out shipping full-stack and desktop work as a freelancer, which is where I
              learned that a fast system nobody can operate is not a finished system. Now I build the
              performance and the interface together: a simulator with a UI, a pipeline with a
              validation loop, a benchmark you can actually run.
            </p>

            <div className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
              <div>
                <MonoLabel>In compute</MonoLabel>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  Parallel and GPU work, quantum circuit simulation, multi-agent AI with real
                  validation, and the platforms that wrap them. Currently on an open quantum
                  workbench at FAST-NUCES.
                </p>
              </div>
              <div>
                <MonoLabel>Off compute</MonoLabel>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  Table tennis, games, and taking apart whatever tool shipped this week to see how it
                  was built. Ran outreach for NaSCon&apos;25, which taught me more about explaining
                  technical work than any course did.
                </p>
              </div>
            </div>

            <div className="mt-9">
              <TextAction to="/about">Full background, timeline, and skills</TextAction>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
