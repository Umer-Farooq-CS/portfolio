import { Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import JsonLd from "@/components/JsonLd";
import { useDocumentMeta } from "@/lib/meta";
import { routeMeta } from "@/data/routeMeta";
import { personSchema } from "@/lib/seo";
import BenchChapter from "@/components/home/BenchChapter";
import WorkChapter from "@/components/home/WorkChapter";
import ProofChapter from "@/components/home/ProofChapter";
import AboutChapter from "@/components/home/AboutChapter";
import TalkChapter from "@/components/home/TalkChapter";
import TechLogoRail from "@/components/technology/TechLogoRail";
import { pathForProfile, useActiveProfile } from "@/lib/profile";
import type { HomeChapterKey } from "@/data/profiles";

// Below the fold, and its data module imports zod — so it loads on demand rather
// than in the homepage's first-load chunk.
const LiveActivity = lazy(() => import("@/components/proof/LiveActivity"));

/**
 * The homepage reads as chapters, and no two share a shape: a full-bleed
 * instrument, a tech marquee, full-width log entries, a dense measurement
 * band, a compact live proof window, a narrow personal column, then a focused
 * contact panel. Which chapters lead, and the hero copy above them, come from
 * the active profile — same components and content, different emphasis.
 */
export default function Index() {
  // Reached only at "/{profile}" (the nested :profile index route), never at
  // bare "/" (the profile selector) — routeMeta(pathname) resolves to that
  // profile's own home entry in route-meta.json.
  const { pathname } = useLocation();
  const profile = useActiveProfile();
  useDocumentMeta({ ...routeMeta(pathname), path: pathname });

  // No section snapping here. Measured on this page, no chapter fits a screen
  // on any device (1.02 to 1.89 viewports on desktop, up to 3.87 on a phone),
  // so snapping had to either skip content or behave differently gesture to
  // gesture. Weighted scrolling in AppShell covers this page instead.

  // "techLogos" is unnumbered (a marquee, not a step in the sequence) — every
  // other chapter's ChapterHeader `index` is its 0-based position in the
  // remaining sequence (bench occupies position 0, unnumbered itself, so
  // "work" right after it is position 1 → shown as "02", and so on) — the
  // same convention Rail.tsx's section list already uses.
  const numbered: HomeChapterKey[] = profile.homeChapterOrder.filter((key) => key !== "techLogos");
  const numberOf = (key: HomeChapterKey) => numbered.indexOf(key);
  const basePath = pathForProfile("/", profile.id);

  return (
    <>
      <JsonLd id="person" data={personSchema()} />
      {profile.homeChapterOrder.map((key) => {
        switch (key) {
          case "bench":
            return (
              <BenchChapter
                key={key}
                headline={profile.heroHeadline}
                subhead={profile.heroSubhead}
                signals={profile.heroSignals}
                worksHref={`${basePath}/projects`}
              />
            );
          case "techLogos":
            return <TechLogoRail key={key} />;
          case "work":
            return <WorkChapter key={key} index={numberOf(key)} basePath={basePath} />;
          case "proof":
            return <ProofChapter key={key} index={numberOf(key)} basePath={basePath} />;
          case "activity":
            return (
              <div key={key} id="activity" className="scroll-mt-20">
                <Suspense fallback={<div className="border-t border-border" />}>
                  <LiveActivity index={numberOf(key)} compact />
                </Suspense>
              </div>
            );
          case "about":
            return <AboutChapter key={key} index={numberOf(key)} basePath={basePath} />;
          case "talk":
            return <TalkChapter key={key} index={numberOf(key)} />;
          default:
            return null;
        }
      })}
    </>
  );
}
