import { Suspense, lazy, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { getProfileByPath } from "@/data/profiles";
import { setStoredProfileId } from "@/lib/profile";

// Lazy here too: this file is itself lazy-loaded from App.tsx, but a static
// import of NotFound would still pull it into this chunk for every profile
// route, not just the rare invalid one.
const NotFound = lazy(() => import("@/pages/NotFound"));

/**
 * Validates the `:profile` URL segment before rendering anything nested under
 * it — an unknown value (a typo, a stale link) 404s here rather than each
 * child page having to guard against it separately. The segment is a `path`
 * (e.g. "solutions" for presales), so it's resolved via getProfileByPath.
 */
export default function ProfileLayout() {
  const { profile } = useParams<{ profile: string }>();
  const resolved = profile ? getProfileByPath(profile) : undefined;

  useEffect(() => {
    if (resolved) setStoredProfileId(resolved.id);
  }, [resolved]);

  if (!resolved) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    );
  }
  return <Outlet />;
}
