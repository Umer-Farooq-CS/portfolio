import { useEffect, useState } from "react";
import { SITE } from "./site";

/**
 * Islamabad local time. Pakistan is UTC+5 year-round with no daylight saving,
 * so this needs no time API — one less network dependency for one clock.
 */
export function islamabadTime(now = new Date()): { hh: string; mm: string; label: string } {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const local = (utcMinutes + SITE.utcOffsetHours * 60 + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(local / 60)).padStart(2, "0");
  const mm = String(local % 60).padStart(2, "0");
  return { hh, mm, label: SITE.timeZoneLabel };
}

/** True during a plausible working window in Islamabad (09:00–23:00 PKT). */
export function isLikelyAwake(now = new Date()): boolean {
  const { hh } = islamabadTime(now);
  const hour = Number(hh);
  return hour >= 9 && hour < 23;
}

/** Ticks once a minute — a seconds display would be motion without information. */
export function useIslamabadClock(): { hh: string; mm: string; label: string; awake: boolean } {
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

  return { ...islamabadTime(now), awake: isLikelyAwake(now) };
}
