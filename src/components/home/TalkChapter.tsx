import { Suspense, lazy, useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { INTENTS, type Intent } from "@/data/intents";
import { SITE_LINKS } from "@/data/siteLinks";
import { accent } from "@/lib/accent";
import { AccentText, ChapterHeader, MonoLabel } from "@/components/kit/Primitives";
import { useMotionPolicy } from "@/lib/motion-policy";

const ContactForm = lazy(() => import("@/components/portfolio/ContactForm"));

/**
 * Chapter 05. Picking a problem and starting a message are the same action: each
 * card fills in the form beside it. The old page described three services and then
 * left the visitor to compose an email from scratch.
 */
export default function TalkChapter() {
  const [selected, setSelected] = useState<Intent | null>(null);
  const { enabled, duration } = useMotionPolicy();

  return (
    <section id="talk" className="scroll-mt-20 border-t border-border py-20 lg:py-28">
      <div className="container">
        <ChapterHeader
          index={5}
          eyebrow="Get in touch"
          title={
            <>
              What do you need <AccentText tone="neural">done</AccentText>?
            </>
          }
          lede="Pick the closest one and it fills in the message. Or write your own — both land in the same inbox."
          tone="neural"
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
          <ul className="grid gap-3 sm:grid-cols-2">
            {INTENTS.map((intent, index) => {
              const tone = accent(intent.accent);
              const isSelected = selected?.id === intent.id;
              return (
                <motion.li
                  key={intent.id}
                  initial={enabled ? { opacity: 0, y: 12 } : { opacity: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: duration(0.45), delay: enabled ? index * 0.05 : 0 }}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(isSelected ? null : intent)}
                    aria-pressed={isSelected}
                    className={`group flex h-full w-full flex-col rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isSelected ? tone.selected : `bg-card ${tone.panel}`
                    }`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className={`text-sm font-semibold leading-snug ${tone.value}`}>
                        {intent.title}
                      </span>
                      {isSelected && (
                        <Check size={14} className={`mt-0.5 shrink-0 ${tone.value}`} aria-hidden="true" />
                      )}
                    </span>
                    <span className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {intent.response}
                    </span>

                    {isSelected && (
                      <span className="mt-3 border-t border-border pt-3">
                        <span className="label-mono">You get</span>
                        <span className="mt-2 flex flex-col gap-1.5">
                          {intent.deliverables.map((item) => (
                            <span key={item} className="flex gap-2 text-2xs text-muted-foreground">
                              <span
                                aria-hidden="true"
                                className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${tone.mark}`}
                              />
                              {item}
                            </span>
                          ))}
                        </span>
                      </span>
                    )}
                  </button>
                </motion.li>
              );
            })}
          </ul>

          <div>
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <MonoLabel className={selected ? accent(selected.accent).label : "text-neural-type"}>
                {selected ? `Re: ${selected.subject}` : "Send a message"}
              </MonoLabel>
              <span className="readout text-2xs text-systems-type">reply in 24–48h</span>
            </div>

            <Suspense
              fallback={
                <div
                  className="h-[30rem] animate-pulse rounded-lg border border-border bg-card"
                  aria-hidden="true"
                />
              }
            >
              {/* Remounting on selection is intentional: it refills the fields. */}
              <ContactForm
                key={selected?.id ?? "blank"}
                defaultSubject={selected?.subject ?? ""}
                defaultMessage={selected?.template ?? ""}
              />
            </Suspense>

            <p className="mt-4 text-xs text-muted-foreground">
              Or reach me directly:{" "}
              <a
                href={SITE_LINKS.email}
                className="text-primary-type underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SITE_LINKS.email.replace("mailto:", "")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
