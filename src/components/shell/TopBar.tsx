import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, MoveVertical, Sun } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTheme } from "@/lib/theme";
import { useScrollMotion } from "@/lib/scroll-motion";
import { useMotionPolicy } from "@/lib/motion-policy";
import { NOTES_ARE_PUBLIC } from "@/data/notes";
import { accent, type VisualAccent } from "@/lib/accent";
import UFMark from "@/components/brand/UFMark";
import ProfileSwitcher from "@/components/profile/ProfileSwitcher";
import { PROFILES } from "@/data/profiles";
import { pathForProfile, stripProfilePrefix, useActiveProfile } from "@/lib/profile";

const NAV: { label: string; to: string; tone: VisualAccent }[] = [
  // "/" resolves through pathForProfile to the active lens's own home page,
  // e.g. /infrastructure. The wordmark to its left goes to the lens selector
  // instead, so the two are different destinations on purpose.
  { label: "Home", to: "/", tone: "thermal" },
  { label: "Work", to: "/projects", tone: "interface" },
  { label: "Services", to: "/services", tone: "systems" },
  { label: "About", to: "/about", tone: "systems" },
  { label: "Lab", to: "/lab", tone: "neural" },
  { label: "CV", to: "/cv", tone: "cryo" },
  // Hidden until the first non-draft note lands, so the nav never points at an
  // empty page. No further edit needed when one does.
  ...(NOTES_ARE_PUBLIC ? [{ label: "Notes", to: "/notes", tone: "neural" as const }] : []),
];

/** Compares against the pathname with any profile prefix already stripped. */
function isActive(to: string, strippedPathname: string): boolean {
  if (to === "/projects") return strippedPathname === "/projects" || strippedPathname.startsWith("/projects/");
  return strippedPathname === to;
}

export default function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { resolved, toggle } = useTheme();
  const { guided, toggle: toggleGuided } = useScrollMotion();
  const { enabled } = useMotionPolicy();
  const profile = useActiveProfile();
  const isDark = resolved === "dark";
  const strippedPathname = stripProfilePrefix(pathname);
  const profileHome = pathForProfile("/", profile.id);
  const onSelector = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname, hash]);

  // The wordmark points at "/", so a click from anywhere else is a real
  // navigation and needs no help. Only a click while already on "/" has
  // nowhere to go, and there it should return to the top.
  const goHome = () => {
    if (!onSelector) return;
    window.scrollTo({ top: 0, behavior: enabled ? "smooth" : "auto" });
    if (hash) navigate(pathname, { replace: true });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ${
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="container flex h-14 items-center justify-between gap-4 lg:h-16">
        <div className="flex shrink-0 items-center gap-3">
          {/* Always the lens selector, never the current lens's home. The
              wordmark is the way back out of a lens; "Home" in the nav is the
              way to the top of the one you are in. */}
          <Link
            to="/"
            onClick={goHome}
            className="group -ml-2 flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <UFMark height={22} animated />
            <span className="font-display text-sm font-semibold tracking-tight text-foreground [font-variation-settings:'wdth'_108]">
              Umer Farooq
            </span>
          </Link>
          {!onSelector && (
            <div className="hidden lg:block">
              <ProfileSwitcher activeId={profile.id} />
            </div>
          )}
        </div>

        {!onSelector && (
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = isActive(item.to, strippedPathname);
              const tone = accent(item.tone);
              return (
                <Link
                  key={item.to}
                  to={pathForProfile(item.to, profile.id)}
                  aria-current={active ? "page" : undefined}
                  className={`pressable rounded-md border px-3 py-1.5 font-mono text-2xs uppercase tracking-widest transition-[color,border-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? tone.chip
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-1">
          {!onSelector && (
            <>
              <div className="hidden md:block lg:hidden">
                <ProfileSwitcher activeId={profile.id} />
              </div>
              <Link
                to={`${profileHome}#talk`}
                className="pressable hidden rounded-md bg-thermal px-3.5 py-1.5 font-mono text-2xs uppercase tracking-widest text-on-thermal transition-[opacity,transform] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-block"
              >
                Talk to me
              </Link>
            </>
          )}

          {/* Guided scrolling is a reading preference, not a design decision,
              so it gets a control rather than being imposed. Hidden on the
              selector, which always travels: there the two screens are the
              page, and plain scrolling would park the reader between them. */}
          {!onSelector && (
            <button
              type="button"
              onClick={toggleGuided}
              aria-pressed={guided}
              aria-label={
                guided
                  ? "Turn off guided section scrolling"
                  : "Turn on guided section scrolling"
              }
              title={guided ? "Guided scrolling: on" : "Guided scrolling: off"}
              className={`pressable flex h-11 w-11 items-center justify-center rounded-md transition-[color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                guided ? "text-primary-type" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MoveVertical size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={toggle}
            aria-pressed={isDark}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="pressable flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-[color,transform] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {!onSelector && (
          <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="pressable flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-[color,transform] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
              >
                <Menu size={18} />
              </button>
            </Dialog.Trigger>
            {/* Radix handles the focus trap, Escape, and focus restore. */}
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background p-6 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-4">
                <Dialog.Title className="label-mono">Menu</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Navigate to the portfolio's main pages or start a conversation.
                </Dialog.Description>
                {!onSelector && (
                  <div className="mt-4 border-b border-border pb-4">
                    <p className="label-mono text-muted-foreground">Viewing as</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {PROFILES.map((viewProfile) => {
                        const isActiveProfile = viewProfile.id === profile.id;
                        const tone = accent(viewProfile.accent);
                        return (
                          <Link
                            key={viewProfile.id}
                            to={pathForProfile(pathname, viewProfile.id)}
                            onClick={() => setMenuOpen(false)}
                            aria-current={isActiveProfile ? "true" : undefined}
                            className={`rounded-md border px-2.5 py-1.5 font-mono text-2xs uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              isActiveProfile ? `${tone.selected} ${tone.value}` : "border-border text-muted-foreground"
                            }`}
                          >
                            {viewProfile.navLabel}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
                <nav aria-label="Mobile" className="mt-4 flex flex-col">
                  {[{ label: "Home", to: "/", tone: "thermal" as const }, ...NAV].map((item) => {
                    const tone = accent(item.tone);
                    const active = isActive(item.to, strippedPathname);
                    return (
                      <Link
                        key={item.to}
                        to={pathForProfile(item.to, profile.id)}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`border-b border-border py-3.5 font-display text-xl last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          active ? tone.value : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <Link
                  to={`${profileHome}#talk`}
                  onClick={() => setMenuOpen(false)}
                  className="mt-6 block rounded-md bg-thermal px-4 py-3 text-center font-mono text-2xs uppercase tracking-widest text-on-thermal"
                >
                  Talk to me
                </Link>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-md border border-border py-2.5 font-mono text-2xs uppercase tracking-widest text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Close
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          )}
        </div>
      </div>
    </header>
  );
}
