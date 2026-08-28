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
 * Chapter 05. Intent chips keep the form in view on small screens. Picking a
 * problem and starting a message are still the same action, but changing the
 * selection never remounts (and therefore never erases) the visitor's draft.
 */
export default function TalkChapter({ index = 5 }: { index?: number }) {
  const [selected, setSelected] = useState<Intent | null>(null);
  const { enabled, duration } = useMotionPolicy();

  return (
    <section id="talk" className="scroll-mt-20 border-t border-border py-20 lg:py-28">
      <div className="container">
        <ChapterHeader
          index={index}
          eyebrow="Get in touch"
          title={
            <>
              What do you need <AccentText tone="neural">done</AccentText>?
            </>
          }
          lede="Pick the closest one and it fills in the message. Or write your own — both land in the same inbox."
          tone="neural"
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14">
          <div className="min-w-0">
            <MonoLabel>Choose a starting point</MonoLabel>
            <ul
              className="signal-scroll mt-4 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0"
              aria-label="Conversation starting points"
            >
            {INTENTS.map((intent, index) => {
              const tone = accent(intent.accent);
              const isSelected = selected?.id === intent.id;
              return (
                <motion.li
                  key={intent.id}
                  className="shrink-0 sm:shrink"
                  initial={enabled ? { opacity: 0, y: 12 } : false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: duration(0.45), delay: enabled ? index * 0.05 : 0 }}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(isSelected ? null : intent)}
                    aria-pressed={isSelected}
                    className={`group inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-left text-xs font-semibold leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isSelected ? tone.selected : `bg-card ${tone.panel}`
                    }`}
                  >
                    <span className={tone.value}>{intent.title}</span>
                    {isSelected && <Check size={14} className={`shrink-0 ${tone.value}`} aria-hidden="true" />}
                  </button>
                </motion.li>
              );
            })}
            </ul>

            <div className="mt-6 min-h-[10.5rem] rounded-lg border border-border bg-surface-alt/45 p-5">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={enabled ? { opacity: 0, y: 8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration(0.22) }}
                >
                  <p className={`text-sm font-semibold ${accent(selected.accent).value}`}>
                    {selected.response}
                  </p>
                  <p className="label-mono mt-5">You get</p>
                  <ul className="mt-2.5 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {selected.deliverables.map((item) => (
                      <li key={item} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${accent(selected.accent).mark}`}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-foreground">Start with the problem, not a brief.</p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Pick the closest intent and I will preload the useful questions. You can edit every word before sending.
                  </p>
                  <p className="readout mt-5 text-2xs uppercase tracking-widest text-systems-type">
                    Typical reply · 24–48 hours
                  </p>
                </div>
              )}
            </div>
          </div>

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
              <ContactForm
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
