import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import AppShell from "@/components/shell/AppShell";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import NotFound from "@/pages/NotFound";
import { PROJECTS } from "@/data/projects";

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MotionPolicyProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MotionPolicyProvider>
    </ThemeProvider>,
  );
}

describe("project routes", () => {
  it("starts with best work and can reveal every project", () => {
    renderAt("/projects");
    expect(screen.getByRole("button", { name: /best work/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: /all projects/i }));

    for (const project of PROJECTS) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
  });

  it("renders a project detail page with its title and technologies", () => {
    const project = PROJECTS[0];
    renderAt(`/projects/${project.slug}`);
    expect(screen.getByRole("heading", { level: 1, name: project.title })).toBeInTheDocument();
    expect(screen.getByText(project.technologies[0])).toBeInTheDocument();
  });

  it("shows the 404 page for an unknown slug", () => {
    renderAt("/projects/not-a-real-project");
    expect(screen.getByText(/404/)).toBeInTheDocument();
  });

  it("gives each project page its own document title", () => {
    const project = PROJECTS[1];
    renderAt(`/projects/${project.slug}`);
    expect(document.title).toContain(project.title);
  });

  it("offers a skip link as the first focusable element", () => {
    renderAt("/projects");
    expect(screen.getByRole("link", { name: "Skip to content" })).toBeInTheDocument();
  });
});
