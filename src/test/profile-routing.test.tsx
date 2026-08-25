import { describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import ProfileLayout from "@/components/profile/ProfileLayout";
import ProjectsPage from "@/pages/ProjectsPage";
import NotFound from "@/pages/NotFound";
import { PROFILES } from "@/data/profiles";

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MotionPolicyProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path=":profile" element={<ProfileLayout />}>
              <Route path="projects" element={<ProjectsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MemoryRouter>
      </MotionPolicyProvider>
    </ThemeProvider>,
  );
}

describe("profile routing", () => {
  // Regression: presales's URL path ("solutions") differs from its id
  // ("presales") — ProfileLayout must resolve the :profile segment by path,
  // not id, or this profile 404s while the other two pass by coincidence.
  it("resolves every profile's real URL path, including one whose path differs from its id", () => {
    for (const profile of PROFILES) {
      renderAt(`/${profile.path}/projects`);
      expect(screen.queryByText(/404/)).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      cleanup(); // each iteration renders fresh — otherwise queries see every prior render too
    }
  });

  it("404s on an unknown profile segment", async () => {
    renderAt("/not-a-profile/projects");
    // NotFound is lazy-loaded inside ProfileLayout, so it resolves a tick after render.
    expect(await screen.findByText(/404/)).toBeInTheDocument();
  });
});
