import type { VisualAccent } from "@/lib/accent";

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

export function telemetryToneForPath(pathname: string): VisualAccent {
  if (pathname.startsWith("/projects/")) return "interface";
  return ROUTE_TONES[pathname] ?? "thermal";
}
