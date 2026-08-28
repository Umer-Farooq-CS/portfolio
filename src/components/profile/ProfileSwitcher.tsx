import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { PROFILES, type ProfileId } from "@/data/profiles";
import { pathForProfile } from "@/lib/profile";
import { accent } from "@/lib/accent";

/**
 * "Viewing as: {label} ⌄" — deliberately small and secondary, not a settings
 * dialog. Switching keeps the visitor on the equivalent page in the new lens
 * (pathForProfile only swaps the leading URL segment), so a project detail
 * page stays on the same project.
 */
export default function ProfileSwitcher({ activeId }: { activeId: ProfileId }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = PROFILES.find((p) => p.id === activeId);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!active) return null;
  const tone = accent(active.accent);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.panel} ${tone.value}`}
      >
        <span className="hidden text-muted-foreground sm:inline">Viewing as</span>
        {active.navLabel}
        <ChevronDown size={12} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Switch profile"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-md border border-border bg-card p-1.5 shadow-lg"
        >
          {PROFILES.map((profile) => {
            const isActive = profile.id === activeId;
            const profileTone = accent(profile.accent);
            return (
              <Link
                key={profile.id}
                to={pathForProfile(pathname, profile.id)}
                role="option"
                aria-selected={isActive}
                onClick={() => setOpen(false)}
                className={`block min-h-11 rounded-md px-2.5 py-2 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive ? `${profileTone.selected} ${profileTone.value}` : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {profile.navLabel}
              </Link>
            );
          })}
          <div className="mt-1 border-t border-border pt-1">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="block min-h-11 rounded-md px-2.5 py-2 font-mono text-2xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Compare all profiles →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
