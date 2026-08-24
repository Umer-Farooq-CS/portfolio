import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ContactForm from "@/components/portfolio/ContactForm";

function renderForm() {
  return render(
    <MemoryRouter>
      <ContactForm />
    </MemoryRouter>,
  );
}

describe("contact form", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("associates every label with its field", () => {
    renderForm();
    expect(screen.getByLabelText(/^name/i)).toHaveAttribute("id", "contact-name");
    expect(screen.getByLabelText(/^email/i)).toHaveAttribute("id", "contact-email");
    expect(screen.getByLabelText(/^subject/i)).toHaveAttribute("id", "contact-subject");
    expect(screen.getByLabelText(/^message/i)).toHaveAttribute("id", "contact-message");
  });

  it("blocks submission and explains what to fix", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/tell me your name/i)).toBeInTheDocument();
    expect(await screen.findByText(/email address doesn't look right/i)).toBeInTheDocument();
    expect(await screen.findByText(/20 characters or more/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("marks invalid fields for assistive tech", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    const email = screen.getByLabelText(/^email/i);
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(email).toHaveAttribute("aria-describedby", "contact-email-error");
  });

  it("silently drops a submission that fills the honeypot", async () => {
    const user = userEvent.setup();
    renderForm();

    const honeypot = document.getElementById("contact-company") as HTMLInputElement;
    await user.type(screen.getByLabelText(/^name/i), "Recruiter");
    await user.type(screen.getByLabelText(/^email/i), "hiring@example.com");
    await user.type(
      screen.getByLabelText(/^message/i),
      "We would like to talk to you about an HPC role.",
    );
    // A bot filling the hidden field fails zod's max(0) rule, so nothing is sent.
    await user.type(honeypot, "spam-corp");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(fetch).not.toHaveBeenCalled());
  });

  it("tells the visitor where to go when the form service is not configured", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^name/i), "Recruiter");
    await user.type(screen.getByLabelText(/^email/i), "hiring@example.com");
    await user.type(
      screen.getByLabelText(/^message/i),
      "We would like to talk to you about an HPC role.",
    );

    // The time-trap requires a realistic fill duration before a real send.
    vi.setSystemTime(Date.now() + 5000);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/email me directly/i);
    expect(fetch).not.toHaveBeenCalled();
  });
});
