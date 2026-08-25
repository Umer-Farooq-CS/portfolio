// Resolves which of the three profiles is active, and rewrites paths between
// them. No Context here — a page calls useActiveProfile() once and passes the
// result down, the same way the rest of the site avoids new global state.

import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  DEFAULT_PROFILE_ID,
  PROFILE_IDS,
  getProfile,
  getProfileByPath,
  isProfileId,
  type ProfileConfig,
  type ProfileId,
} from "@/data/profiles";

export const PROFILE_STORAGE_KEY = "uf-profile";

export function getStoredProfileId(): ProfileId | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return stored && isProfileId(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function setStoredProfileId(id: ProfileId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, id);
  } catch {
    // Storage can throw under private browsing or a full quota — persistence
    // is a nicety, not something a page should fail over.
  }
}

/**
 * The `:profile` URL segment, resolved to a profile id — if the current route
 * is nested under one and its path matches a real profile. The segment is a
 * `path` (e.g. "solutions" for presales), not an `id`, so this must go
 * through getProfileByPath rather than isProfileId/getProfile.
 */
export function useUrlProfileId(): ProfileId | null {
  const { profile } = useParams<{ profile?: string }>();
  if (!profile) return null;
  return getProfileByPath(profile)?.id ?? null;
}

/**
 * The active profile: the URL's `:profile` segment when present (which is
 * also persisted, so it becomes the fallback for bare, unprefixed routes),
 * else the stored fallback, else the default. Never redirects — this only
 * decides which config the current page renders with.
 */
export function useActiveProfile(): ProfileConfig {
  const urlProfileId = useUrlProfileId();
  const resolvedId = urlProfileId ?? getStoredProfileId() ?? DEFAULT_PROFILE_ID;

  useEffect(() => {
    if (urlProfileId) setStoredProfileId(urlProfileId);
  }, [urlProfileId]);

  return useMemo(() => getProfile(resolvedId), [resolvedId]);
}

/** Strips a leading "/{profilePath}" segment, if the pathname has one. */
export function stripProfilePrefix(pathname: string): string {
  for (const id of PROFILE_IDS) {
    const prefix = `/${getProfile(id).path}`;
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

/** The equivalent URL under a different (or the same) profile. */
export function pathForProfile(pathname: string, targetId: ProfileId): string {
  const rest = stripProfilePrefix(pathname);
  const targetPrefix = `/${getProfile(targetId).path}`;
  return rest === "/" ? targetPrefix : `${targetPrefix}${rest}`;
}
