import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/portfolio/Header";
import Footer from "@/components/portfolio/Footer";

export default function Layout() {
  const [darkMode, setDarkMode] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Scroll to top when navigating to any top-level page (About, Services, Projects, etc.)
  // Home (/) is handled by Index so hash links like #contact work correctly
  useEffect(() => {
    if (pathname !== "/") window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode((d) => !d)} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
