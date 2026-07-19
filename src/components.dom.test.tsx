// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal, Tabs } from "./components";

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

  it("keeps focus and uses the latest onClose when the handler identity changes", () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = render(
      <Modal onClose={first} open title="t">
        <button type="button">inner</button>
      </Modal>,
    );
    const inner = view.getByRole("button", { name: "inner" });
    inner.focus();
    view.rerender(
      <Modal onClose={second} open title="t">
        <button type="button">inner</button>
      </Modal>,
    );
    expect(document.activeElement).toBe(inner);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });
});

function TabsHarness() {
  const [value, setValue] = useState<"a" | "b" | "c">("a");
  return (
    <Tabs
      aria-label="Demo"
      onValueChange={setValue}
      tabs={[
        { label: "A", value: "a" },
        { label: "B", value: "b" },
        { label: "C", value: "c" },
      ]}
      value={value}
    />
  );
}

describe("Tabs keyboard behavior", () => {
  it("gives only the active tab tabIndex 0", () => {
    const view = render(<TabsHarness />);
    const tabs = view.getAllByRole("tab");
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
  });

  it("moves selection right with wrapping and focuses the new tab", () => {
    const view = render(<TabsHarness />);
    let tabs = view.getAllByRole("tab");
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    tabs = view.getAllByRole("tab");
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(tabs[1]);
    fireEvent.keyDown(tabs[1], { key: "ArrowRight" });
    fireEvent.keyDown(view.getAllByRole("tab")[2], { key: "ArrowRight" });
    expect(view.getAllByRole("tab")[0].getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("moves selection left with wrapping", () => {
    const view = render(<TabsHarness />);
    const tabs = view.getAllByRole("tab");
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    expect(view.getAllByRole("tab")[2].getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("jumps to first and last with Home and End", () => {
    const view = render(<TabsHarness />);
    const tabs = view.getAllByRole("tab");
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "End" });
    expect(view.getAllByRole("tab")[2].getAttribute("aria-selected")).toBe(
      "true",
    );
    fireEvent.keyDown(view.getAllByRole("tab")[2], { key: "Home" });
    expect(view.getAllByRole("tab")[0].getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("selects a tab on click", () => {
    const view = render(<TabsHarness />);
    fireEvent.click(view.getAllByRole("tab")[1]);
    expect(view.getAllByRole("tab")[1].getAttribute("aria-selected")).toBe(
      "true",
    );
  });
});
