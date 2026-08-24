import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { INTENTS } from "@/data/intents";
import { accent } from "@/lib/accent";
import { ChapterHeader, MonoLabel } from "@/components/kit/Primitives";
import { useDocumentMeta } from "@/lib/meta";
import { useMotionPolicy } from "@/lib/motion-policy";

/**
 * Services, written as the problems people arrive with rather than the
 * capabilities I'd like to list. Each one opens to show what it involves and what
 * comes back, then hands off to a contact form that already knows the subject.
 */
export default function ServicesPage() {
  const [open, setOpen] = useState<string | null>(INTENTS[0].id);
  const { enabled, duration } = useMotionPolicy();

  useDocumentMeta({
    title: "Services",
    path: "/services",
    description:
      "GPU and parallel performance work, quantum simulation platforms, reliable AI pipelines, full-stack builds, and architecture review.",
  });

  return (
    <div className="pb-20 pt-28 lg:pt-36">
      <div className="container">
        <ChapterHeader
          eyebrow="Services"
          title="Start from the problem, not the toolchain"
          lede="Six things people usually need. Open one to see what it involves, what you get back, and roughly how I'd approach it."
          as="h1"
        />

        <ul className="mt-14 border-t border-border">
          {INTENTS.map((intent, index) => {
            const tone = accent(intent.accent);
            const isOpen = open === intent.id;
            return (
              <motion.li
                key={intent.id}
                initial={enabled ? { opacity: 0, y: 10 } : { opacity: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: duration(0.45), delay: enabled ? index * 0.04 : 0 }}
                className="border-b border-border"
                id={intent.id}
              >
                <h2>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : intent.id)}
                    aria-expanded={isOpen}
                    aria-controls={`${intent.id}-panel`}
                    className="group flex w-full items-baseline gap-4 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="readout shrink-0 text-2xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span className="block text-xl text-foreground group-hover:text-primary-type sm:text-2xl">
                        {intent.title}
                      </span>
                      <span className={`mt-1.5 block font-mono text-2xs uppercase tracking-widest ${tone.label}`}>
                        {intent.subject}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`shrink-0 font-mono text-lg text-muted-foreground transition-transform ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                </h2>

                {isOpen && (
                  <div id={`${intent.id}-panel`} className="grid gap-8 pb-9 lg:grid-cols-2 lg:gap-14">
                    <div>
                      <MonoLabel>What I do</MonoLabel>
                      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                        {intent.response}
                      </p>
                      <Link
                        to={`/#talk`}
                        className="group mt-6 inline-flex items-center gap-2 rounded-md bg-thermal px-4 py-2 font-mono text-2xs uppercase tracking-widest text-on-thermal transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Start this conversation
                        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </div>
                    <div>
                      <MonoLabel>What you get</MonoLabel>
                      <ul className="mt-3 flex flex-col gap-2.5">
                        {intent.deliverables.map((item) => (
                          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                            <Check size={13} className="mt-1 shrink-0 text-primary-type" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </motion.li>
            );
          })}
        </ul>

        <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
          Not on the list? The pattern is the same either way — tell me what the system does and
          where it hurts, and I&apos;ll tell you honestly whether I&apos;m the right person for it.
        </p>
      </div>
    </div>
  );
}
