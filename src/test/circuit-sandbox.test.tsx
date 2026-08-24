import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CircuitSandbox from "@/components/lab/CircuitSandbox";

describe("CircuitSandbox", () => {
  it("contains its wide editor and exposes it to keyboard scrolling", () => {
    render(<CircuitSandbox />);

    const editor = screen.getByRole("region", { name: /scrollable quantum circuit editor/i });
    expect(editor).toHaveClass("min-w-0", "max-w-full", "overflow-x-auto");
    expect(editor).toHaveAttribute("tabindex", "0");

    editor.focus();
    expect(editor).toHaveFocus();
  });

  it("keeps primary mobile controls touch-sized and preserves gate placement", async () => {
    const user = userEvent.setup();
    render(<CircuitSandbox />);

    const palette = screen.getByRole("radiogroup", { name: /gate to place/i });
    for (const gate of within(palette).getAllByRole("radio")) {
      expect(gate).toHaveClass("min-h-11", "min-w-11");
    }

    const slot = screen.getByRole("button", {
      name: /place h on qubit 2, step 6/i,
    });
    expect(slot).toHaveClass("h-11");
    await user.click(slot);
    expect(
      screen.getByRole("button", { name: /remove h on qubit 2, step 6/i }),
    ).toBeInTheDocument();
  });
});
