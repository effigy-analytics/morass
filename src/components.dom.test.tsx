// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "./components";

afterEach(cleanup);

function renderModal(onClose = vi.fn()) {
  const view = render(
    <Modal onClose={onClose} open title="Focus test">
      <button type="button">first</button>
      <button type="button">second</button>
    </Modal>,
  );
  return { onClose, view };
}

describe("Modal keyboard behavior", () => {
  it("closes on Escape", () => {
    const { onClose } = renderModal();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("focuses the panel on open", () => {
    renderModal();
    expect(document.activeElement?.getAttribute("role")).toBe("dialog");
  });

  it("wraps Tab from the last focusable to the first", () => {
    const { view } = renderModal();
    const buttons = view.getAllByRole("button");
    const last = buttons[buttons.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("wraps Shift+Tab from the panel to the last focusable", () => {
    const { view } = renderModal();
    const buttons = view.getAllByRole("button");
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  });

  it("restores focus to the previously focused element on close", () => {
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    const view = render(
      <Modal onClose={vi.fn()} open title="t">
        <button type="button">inner</button>
      </Modal>,
    );
    view.rerender(
      <Modal onClose={vi.fn()} open={false} title="t">
        <button type="button">inner</button>
      </Modal>,
    );
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });
});
