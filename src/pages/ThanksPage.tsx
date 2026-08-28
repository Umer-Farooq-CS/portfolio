import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { SITE_LINKS } from "@/data/siteLinks";
import { MonoLabel } from "@/components/kit/Primitives";
import { useDocumentMeta } from "@/lib/meta";
import { routeMeta } from "@/data/routeMeta";
import { useSiteClock } from "@/lib/clock";
import { useMotionPolicy } from "@/lib/motion-policy";

export default function ThanksPage() {
  const clock = useSiteClock();
  const { enabled, duration } = useMotionPolicy();

  useDocumentMeta({ ...routeMeta("/thanks"), path: "/thanks", noIndex: true });

  return (
    <div className="flex min-h-[70vh] items-center pb-20 pt-28">
      <div className="container max-w-xl">
        <motion.div
          initial={enabled ? { opacity: 0, y: 14 } : { opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration(0.5) }}
        >
          <MonoLabel className="text-systems-type">Sent</MonoLabel>
          <h1 className="mt-4 text-4xl text-systems-type">Message received</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            It&apos;s <span className="readout text-systems-type">{clock.hh}:{clock.mm} {clock.label}</span>{" "}
            where I am. I read everything that arrives
            and usually reply within 24 to 48 hours — sooner if it&apos;s a problem I find
            interesting.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-md bg-thermal px-5 py-2.5 font-mono text-2xs uppercase tracking-widest text-on-thermal transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
              Back home
            </Link>
            <Link
              to="/lab"
              className="inline-flex items-center gap-2 rounded-md border border-neural/30 px-5 py-2.5 font-mono text-2xs uppercase tracking-widest text-neural-type transition-colors hover:border-neural focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Something to play with
            </Link>
          </div>

          <p className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">
            If it&apos;s urgent, email me directly at{" "}
            <a
              href={SITE_LINKS.email}
              className="text-interface-type underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {SITE_LINKS.email.replace("mailto:", "")}
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
