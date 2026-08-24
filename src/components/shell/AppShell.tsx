import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import Rail from "./Rail";
import ScrollProgress from "./ScrollProgress";
import SiteFooter from "./SiteFooter";
import TelemetryBackdrop from "./TelemetryBackdrop";
import { useMotionPolicy } from "@/lib/motion-policy";
import { telemetryToneForPath } from "@/lib/telemetry";

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

export default function AppShell() {
  const { pathname, hash } = useLocation();
  const { enabled } = useMotionPolicy();

  // One place owns scroll behaviour on navigation: hash links scroll to their
  // target, everything else lands at the top. The short observer window matters
  // on the homepage because lazy activity can mount above #about and #talk after
  // the first scroll and otherwise move the requested section out of view.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const scrollToTarget = () => {
      const target = document.getElementById(hash.slice(1));
      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: enabled ? "smooth" : "auto", block: "start" });
      }
    };

    scrollToTarget();

    const main = document.getElementById("main");
    if (!main || typeof MutationObserver === "undefined") return;

    const observer = new MutationObserver(scrollToTarget);
    observer.observe(main, { childList: true, subtree: true });

    const stopFollowingLayout = () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener("wheel", stopFollowingLayout);
      window.removeEventListener("touchstart", stopFollowingLayout);
      window.removeEventListener("keydown", stopFollowingLayout);
    };

    const timer = window.setTimeout(stopFollowingLayout, 1800);
    window.addEventListener("wheel", stopFollowingLayout, { passive: true });
    window.addEventListener("touchstart", stopFollowingLayout, { passive: true });
    window.addEventListener("keydown", stopFollowingLayout);
    return stopFollowingLayout;
  }, [pathname, hash, enabled]);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-background text-foreground">
      <TelemetryBackdrop />

      <div className="relative z-10">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-thermal focus:px-4 focus:py-2 focus:font-mono focus:text-2xs focus:uppercase focus:tracking-widest focus:text-on-thermal"
        >
          Skip to content
        </a>

        <ScrollProgress />
        <TopBar />
        <Rail />

        <main id="main" className="xl:pl-24">
          <div
            key={pathname}
            className="route-content-reveal"
            data-accent={telemetryToneForPath(pathname)}
          >
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
