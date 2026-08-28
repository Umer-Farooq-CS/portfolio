import { useEffect, useState } from "react";
import { SITE } from "./site";

/**
 * The clock the status readouts run on, offset from UTC by SITE.utcOffsetHours.
 * At UTC there is no daylight saving to track, so this needs no time API — one
 * less network dependency for one clock.
 */
export function siteTime(now = new Date()): { hh: string; mm: string; label: string } {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const local = (utcMinutes + SITE.utcOffsetHours * 60 + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(local / 60)).padStart(2, "0");
  const mm = String(local % 60).padStart(2, "0");
  return { hh, mm, label: SITE.timeZoneLabel };
}

/** True during a plausible working window — 04:00–18:00 UTC. */
export function isLikelyAwake(now = new Date()): boolean {
  const { hh } = siteTime(now);
  const hour = Number(hh);
  return hour >= 4 && hour < 18;
}

/** Ticks once a minute — a seconds display would be motion without information. */
export function useSiteClock(): { hh: string; mm: string; label: string; awake: boolean } {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), 60_000);
    }, msToNextMinute);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return { ...siteTime(now), awake: isLikelyAwake(now) };
}
