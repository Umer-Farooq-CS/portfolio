import type { VisualAccent } from "@/lib/accent";
import { stripProfilePrefix } from "@/lib/profile";

const ROUTE_TONES: Record<string, VisualAccent> = {
  "/about": "systems",
  "/services": "thermal",
  "/projects": "interface",
  "/lab": "cryo",
  "/thanks": "systems",
  "/cv": "systems",
  "/uses": "interface",
  "/notes": "neural",
};

/** Strips a leading profile segment first, so "/development/lab" reads the same as "/lab". */
export function telemetryToneForPath(pathname: string): VisualAccent {
  const rest = stripProfilePrefix(pathname);
  if (rest.startsWith("/projects/")) return "interface";
  return ROUTE_TONES[rest] ?? "thermal";
}
