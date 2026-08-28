import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import Index from "@/pages/Index";
import { getFeaturedProjects } from "@/data/projects";
import { SITE_LINKS } from "@/data/siteLinks";
import { CHAPTER_SECTIONS } from "@/lib/sections";

function renderHome() {
  return render(
    <ThemeProvider>
      <MotionPolicyProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Index />
        </MemoryRouter>
      </MotionPolicyProvider>
    </ThemeProvider>,
  );
}

describe("homepage", () => {
  it("renders every section without crashing", () => {
    renderHome();
    for (const section of Object.values(CHAPTER_SECTIONS)) {
      if (section.id === "tech-logos") continue; // a marquee strip, not an anchored chapter
      expect(document.getElementById(section.id), `#${section.id} is missing`).not.toBeNull();
    }
  });

  it("shows the featured projects from the shared data source", () => {
    renderHome();
    const featured = getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    for (const project of featured) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
  });

  it("uses SITE_LINKS for the contact details", () => {
    renderHome();
    const email = SITE_LINKS.email.replace("mailto:", "");
    expect(screen.getAllByText(email).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Islamabad/).length).toBeGreaterThan(0);
  });

  it("sets the homepage document title", () => {
    renderHome();
    expect(document.title).toMatch(/Umer Farooq/);
  });

  it("gives every image an intrinsic size so nothing shifts on load", () => {
    renderHome();
    for (const img of Array.from(document.querySelectorAll("img"))) {
      expect(img.getAttribute("width"), `missing width on ${img.getAttribute("src")}`).toBeTruthy();
      expect(img.getAttribute("height"), `missing height on ${img.getAttribute("src")}`).toBeTruthy();
    }
  });

  it("serves modern formats before the fallback", () => {
    renderHome();
    const sources = Array.from(document.querySelectorAll("picture source"));
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((s) => s.getAttribute("type") === "image/avif")).toBe(true);
  });
});
