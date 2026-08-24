import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTheme } from "@/lib/theme";
import { useMotionPolicy } from "@/lib/motion-policy";
import { NOTES_ARE_PUBLIC } from "@/data/notes";
import { accent, type VisualAccent } from "@/lib/accent";

const NAV: { label: string; to: string; tone: VisualAccent }[] = [
  { label: "Work", to: "/projects", tone: "interface" },
  { label: "Services", to: "/services", tone: "systems" },
  { label: "About", to: "/about", tone: "systems" },
  { label: "Lab", to: "/lab", tone: "neural" },
  { label: "CV", to: "/cv", tone: "cryo" },
  // Hidden until the first non-draft note lands, so the nav never points at an
  // empty page. No further edit needed when one does.
  ...(NOTES_ARE_PUBLIC ? [{ label: "Notes", to: "/notes", tone: "neural" as const }] : []),
];

function isActive(to: string, pathname: string): boolean {
  if (to === "/projects") return pathname === "/projects" || pathname.startsWith("/projects/");
  return pathname === to;
}

export default function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { resolved, toggle } = useTheme();
  const { enabled } = useMotionPolicy();
  const isDark = resolved === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname, hash]);

  const goHome = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: enabled ? "smooth" : "auto" });
      if (hash) navigate("/", { replace: true });
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ${
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="container flex h-14 items-center justify-between gap-4 lg:h-16">
        <Link
          to="/"
          onClick={goHome}
          className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-sm bg-thermal font-mono text-2xs font-semibold text-on-thermal"
          >
            UF
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-foreground [font-variation-settings:'wdth'_108]">
            Umer Farooq
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.to, pathname);
            const tone = accent(item.tone);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`rounded-md border px-3 py-1.5 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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

        <div className="flex items-center gap-1">
          <Link
            to="/#talk"
            className="hidden rounded-md bg-thermal px-3.5 py-1.5 font-mono text-2xs uppercase tracking-widest text-on-thermal transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-block"
          >
            Talk to me
          </Link>

          <button
            type="button"
            onClick={toggle}
            aria-pressed={isDark}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
              >
                <Menu size={18} />
              </button>
            </Dialog.Trigger>
            {/* Radix handles the focus trap, Escape, and focus restore. */}
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background p-6 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-4">
                <Dialog.Title className="label-mono">Menu</Dialog.Title>
                <nav aria-label="Mobile" className="mt-4 flex flex-col">
                  {[{ label: "Home", to: "/", tone: "thermal" as const }, ...NAV].map((item) => {
                    const tone = accent(item.tone);
                    const active = isActive(item.to, pathname);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
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
                  to="/#talk"
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
        </div>
      </div>
    </header>
  );
}
