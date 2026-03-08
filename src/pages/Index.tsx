import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "@/components/portfolio/HeroSection";
import AboutSection from "@/components/portfolio/AboutSection";
import ServicesSection from "@/components/portfolio/ServicesSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import ContactSection from "@/components/portfolio/ContactSection";

const Index = () => {
  const location = useLocation();

  // When navigating to home with no hash, scroll to top
  useEffect(() => {
    const hash = location.hash?.slice(1) ?? "";
    if (hash === "") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const scrollToHash = () => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    requestAnimationFrame(scrollToHash);
    const t = setTimeout(scrollToHash, 100);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  return (
  <>
    <HeroSection />
    <AboutSection />
    <ServicesSection />
    <ProjectsSection />
    <ContactSection />
  </>
  );
};

export default Index;
