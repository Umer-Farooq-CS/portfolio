import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import Rail from "./Rail";
import ScrollProgress from "./ScrollProgress";
import SiteFooter from "./SiteFooter";
import { useMotionPolicy } from "@/lib/motion-policy";

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
    <div className="min-h-screen bg-background text-foreground">
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
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
