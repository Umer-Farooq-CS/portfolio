import { Mail, Phone, Linkedin, Github, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="border-t border-border bg-card/50 relative">
      <div className="container px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-accent flex items-center justify-center">
              <span className="text-xs font-black text-primary-foreground">UF</span>
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Umer Farooq</p>
              <p className="text-xs text-muted-foreground">AI & HPC Infrastructure Engineer</p>
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            <a
              href="mailto:umerfarooqcs0891@gmail.com"
              className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
              title="Email"
            >
              <Mail size={15} />
            </a>
            <a
              href="tel:+923365522666"
              className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
              title="Phone"
            >
              <Phone size={15} />
            </a>
            <a
              href="https://linkedin.com/in/umer-farooq-a0838a2a1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
              title="LinkedIn"
            >
              <Linkedin size={15} />
            </a>
            <a
              href="https://github.com/Umer-Farooq-CS"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
              title="GitHub"
            >
              <Github size={15} />
            </a>
          </div>

          {/* Copyright + scroll to top */}
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Umer Farooq. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200 hover:scale-105"
              title="Scroll to top"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
