import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "@/components/ErrorBoundary";

function BrokenView(): never {
  throw new Error("render failed");
}

describe("error boundary exits", () => {
  afterEach(() => vi.restoreAllMocks());

  it("keeps the home link inside the deployed base path", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <BrokenView />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("link", { name: /go home/i })).toHaveAttribute(
      "href",
      import.meta.env.BASE_URL,
    );
  });
});
