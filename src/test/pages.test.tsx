import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import AppShell from "@/components/shell/AppShell";
import CvPage from "@/pages/CvPage";
import UsesPage from "@/pages/UsesPage";
import NotesPage from "@/pages/NotesPage";
import {
  AWARDS,
  CV_CONTACT,
  CV_EDUCATION_HIGHLIGHTS,
  CV_PROJECT_SLUGS,
  EXPERIENCE,
  LANGUAGES,
  awardSchema,
  cvContactSchema,
  cvProjectOverflow,
  experienceSchema,
  getCvProjects,
  languageSchema,
} from "@/data/cv";
import { CERTIFICATIONS, EDUCATION, PROFESSIONAL_SUMMARY, SKILL_GROUPS } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { USES_GROUPS, getUnconfirmedItems, usesGroupSchema } from "@/data/uses";
import { NOTES, NOTES_ARE_PUBLIC, getNoteBySlug, getPublishedNotes, noteSchema } from "@/data/notes";

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MotionPolicyProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/cv" element={<CvPage />} />
              <Route path="/uses" element={<UsesPage />} />
              <Route path="/notes" element={<NotesPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MotionPolicyProvider>
    </ThemeProvider>,
  );
}

describe("/cv", () => {
  it("renders the name, role, and every contact line", () => {
    renderAt("/cv");
    expect(screen.getByRole("heading", { level: 1, name: "Umer Farooq" })).toBeInTheDocument();
    for (const item of CV_CONTACT) {
      expect(screen.getAllByText(item.text).length).toBeGreaterThan(0);
    }
  });

  it("renders the education entry from profile.ts", () => {
    renderAt("/cv");
    expect(screen.getByText(EDUCATION.degree)).toBeInTheDocument();
    expect(screen.getByText(EDUCATION.institution)).toBeInTheDocument();
    expect(screen.getByText(EDUCATION.period)).toBeInTheDocument();
  });

  it("takes its summary and skills verbatim from profile.ts, not a second copy", () => {
    renderAt("/cv");
    expect(screen.getByText(PROFESSIONAL_SUMMARY)).toBeInTheDocument();
    for (const group of SKILL_GROUPS) {
      expect(screen.getByText(group.title)).toBeInTheDocument();
      expect(screen.getByText(group.items[0])).toBeInTheDocument();
    }
  });

  it("lists every certification with its issuer", () => {
    renderAt("/cv");
    for (const cert of CERTIFICATIONS) {
      expect(screen.getByText(cert.title)).toBeInTheDocument();
      expect(screen.getAllByText(cert.issuer).length).toBeGreaterThan(0);
    }
  });

  it("lists the experience and awards that only cv.ts carries", () => {
    renderAt("/cv");
    for (const job of EXPERIENCE) {
      expect(screen.getByRole("heading", { level: 3, name: job.role })).toBeInTheDocument();
    }
    for (const award of AWARDS) {
      expect(screen.getByText(award.title)).toBeInTheDocument();
    }
    for (const language of LANGUAGES) {
      expect(screen.getByText(language.language)).toBeInTheDocument();
    }
  });

  it("caps the project list and points at /projects for the rest", () => {
    renderAt("/cv");
    const section = screen.getByRole("region", { name: /selected projects/i });
    expect(within(section).getAllByRole("listitem")).toHaveLength(CV_PROJECT_SLUGS.length);
    expect(CV_PROJECT_SLUGS.length).toBeLessThan(PROJECTS.length);

    const allProjects = screen.getByRole("link", {
      name: new RegExp(`all ${PROJECTS.length} projects`, "i"),
    });
    // Bare /cv resolves to the default profile and normalizes its internal
    // links into that profile's URL space — same as TopBar, ProjectsPage, and
    // WorkChapter already do (see src/lib/profile.ts's pathForProfile).
    expect(allProjects).toHaveAttribute("href", "/development/projects");
    // The count of what was left out has to be stated, not implied.
    expect(screen.getByText(new RegExp(`${cvProjectOverflow()} further projects`))).toBeInTheDocument();
  });

  it("offers a print button that calls window.print", () => {
    const printSpy = vi.fn();
    Object.defineProperty(window, "print", { writable: true, value: printSpy });

    renderAt("/cv");
    const button = screen.getByRole("button", { name: /print or save as pdf/i });
    fireEvent.click(button);
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it("links to the PDF under the deployed base path", () => {
    renderAt("/cv");
    const download = screen.getByRole("link", { name: /download the pdf/i });
    expect(download.getAttribute("href")).toContain("umer-farooq-cv.pdf");
  });

  it("gives the route its own title", () => {
    renderAt("/cv");
    expect(document.title).toContain("CV");
  });
});

describe("cv data", () => {
  it("matches its schemas", () => {
    for (const job of EXPERIENCE) expect(() => experienceSchema.parse(job)).not.toThrow();
    for (const award of AWARDS) expect(() => awardSchema.parse(award)).not.toThrow();
    for (const language of LANGUAGES) expect(() => languageSchema.parse(language)).not.toThrow();
    for (const item of CV_CONTACT) expect(() => cvContactSchema.parse(item)).not.toThrow();
  });

  it("resolves every selected slug against projects.ts", () => {
    // A renamed slug would otherwise shrink the CV silently.
    expect(getCvProjects()).toHaveLength(CV_PROJECT_SLUGS.length);
    expect(cvProjectOverflow()).toBe(PROJECTS.length - CV_PROJECT_SLUGS.length);
  });

  it("drops the coursework prose so it is not printed twice", () => {
    expect(EDUCATION.highlights.some((h) => /^relevant coursework/i.test(h))).toBe(true);
    expect(CV_EDUCATION_HIGHLIGHTS.some((h) => /^relevant coursework/i.test(h))).toBe(false);
    expect(CV_EDUCATION_HIGHLIGHTS.length).toBe(EDUCATION.highlights.length - 1);
  });

  it("formats the phone number into readable groups", () => {
    const phone = CV_CONTACT.find((item) => item.label === "Phone");
    expect(phone?.text).toBe("+92 336 5522666");
    expect(phone?.href).toBe("tel:+923365522666");
  });
});

describe("/uses", () => {
  it("describes the mobile navigation dialog for assistive technology", () => {
    renderAt("/uses");
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const dialog = screen.getByRole("dialog", { name: "Menu" });
    const descriptionId = dialog.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId ?? "")).toHaveTextContent(
      "Navigate to the portfolio's main pages or start a conversation.",
    );
  });

  it("renders every group and every row", () => {
    renderAt("/uses");
    for (const group of USES_GROUPS) {
      expect(screen.getByRole("heading", { level: 2, name: group.title })).toBeInTheDocument();
      for (const item of group.items) {
        expect(screen.getByText(item.value)).toBeInTheDocument();
      }
    }
  });

  it("marks unconfirmed rows instead of inventing a specific", () => {
    const { container } = renderAt("/uses");
    const unconfirmed = getUnconfirmedItems();
    expect(unconfirmed.length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-todo="true"]')).toHaveLength(unconfirmed.length);
    expect(screen.getAllByText("Unconfirmed")).toHaveLength(unconfirmed.length);
  });

  it("matches its schema", () => {
    for (const group of USES_GROUPS) expect(() => usesGroupSchema.parse(group)).not.toThrow();
  });
});

describe("/notes", () => {
  it("is not public while every note is a draft", () => {
    expect(NOTES.length).toBeGreaterThan(0);
    expect(getPublishedNotes()).toHaveLength(0);
    expect(NOTES_ARE_PUBLIC).toBe(false);
  });

  it("does not resolve a draft slug", () => {
    expect(getNoteBySlug(NOTES[0].slug)).toBeUndefined();
    expect(getNoteBySlug("not-a-note")).toBeUndefined();
  });

  it("renders an empty state that says what will appear and where to go instead", () => {
    renderAt("/notes");
    expect(screen.getByText("No notes published yet")).toBeInTheDocument();
    expect(screen.getByText("Parallel performance")).toBeInTheDocument();
    expect(screen.getByText("Quantum simulation")).toBeInTheDocument();
    expect(screen.getByText("Verifiable AI output")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /run the benchmarks/i })).toHaveAttribute("href", "/lab");
    expect(screen.getByRole("link", { name: /read the project write-ups/i })).toHaveAttribute(
      "href",
      "/projects",
    );
  });

  it("stays out of the index while there is nothing to index", () => {
    renderAt("/notes");
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
      "noindex, nofollow",
    );
  });

  it("matches its schema", () => {
    for (const note of NOTES) expect(() => noteSchema.parse(note)).not.toThrow();
  });
});
