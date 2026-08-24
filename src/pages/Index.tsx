import { Suspense, lazy } from "react";
import JsonLd from "@/components/JsonLd";
import { useDocumentMeta } from "@/lib/meta";
import { routeMeta } from "@/data/routeMeta";
import { personSchema } from "@/lib/seo";
import BenchChapter from "@/components/home/BenchChapter";
import WorkChapter from "@/components/home/WorkChapter";
import ProofChapter from "@/components/home/ProofChapter";
import AboutChapter from "@/components/home/AboutChapter";
import TalkChapter from "@/components/home/TalkChapter";

// Below the fold, and its data module imports zod — so it loads on demand rather
// than in the homepage's first-load chunk.
const LiveActivity = lazy(() => import("@/components/proof/LiveActivity"));

/**
 * The homepage reads as five chapters, and no two share a shape: a full-bleed
 * instrument, full-width log entries, a dense measurement band, a narrow column,
 * then a panel. The old page repeated one centered card-grid section five times.
 */
export default function Index() {
  useDocumentMeta({ ...routeMeta("/"), path: "/" });

  return (
    <>
      <JsonLd id="person" data={personSchema()} />
      <BenchChapter />
      <WorkChapter />
      <ProofChapter />
      <Suspense fallback={<div className="border-t border-border" />}>
        <LiveActivity />
      </Suspense>
      <AboutChapter />
      <TalkChapter />
    </>
  );
}
