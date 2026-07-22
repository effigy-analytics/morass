// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal, SelectField, Tabs, TextField } from "./components";

afterEach(cleanup);

describe("Field accessibility", () => {
  it("associates help and errors while preserving caller descriptions", () => {
    const view = render(
      <>
        <span id="account-context">Used for receipts.</span>
        <TextField
          aria-describedby="account-context"
          error="Required"
          helpText="Use your work address."
          id="account-email"
          label="Email"
        />
      </>,
    );
    const input = view.getByRole("textbox", { name: "Email" });
    const descriptions = input.getAttribute("aria-describedby")?.split(" ");

    expect(descriptions).toHaveLength(3);
    expect(descriptions?.[0]).toBe("account-context");
    expect(document.getElementById(descriptions?.[1] ?? "")?.textContent).toBe(
      "Use your work address.",
    );
    expect(document.getElementById(descriptions?.[2] ?? "")?.textContent).toBe(
      "Required",
    );
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("labels selects and leaves valid fields unmarked", () => {
    const view = render(
      <SelectField
        helpText="Choose one."
        label="Frequency"
        defaultValue="monthly"
      >
        <option value="monthly">Monthly</option>
      </SelectField>,
    );
    const select = view.getByRole("combobox", { name: "Frequency" });
    const description = select.getAttribute("aria-describedby");

    expect(document.getElementById(description ?? "")?.textContent).toBe(
      "Choose one.",
    );
    expect(select.hasAttribute("aria-invalid")).toBe(false);
  });

  it("generates unique control and description identifiers", () => {
    const view = render(
      <>
        <TextField helpText="First help" label="First" />
        <TextField helpText="Second help" label="Second" />
      </>,
    );
    const first = view.getByRole("textbox", { name: "First" });
    const second = view.getByRole("textbox", { name: "Second" });

    expect(first.id).not.toBe(second.id);
    expect(first.getAttribute("aria-describedby")).not.toBe(
      second.getAttribute("aria-describedby"),
    );
  });

  it("uses labelProps.htmlFor as the control id unless id is explicit", () => {
    const view = render(
      <>
        <TextField label="Alias" labelProps={{ htmlFor: "alias" }} />
        <SelectField
          id="explicit-frequency"
          label="Frequency"
          labelProps={{ htmlFor: "ignored-frequency" }}
        >
          <option>Monthly</option>
        </SelectField>
      </>,
    );

    expect(view.getByRole("textbox", { name: "Alias" }).id).toBe("alias");
    expect(view.getByRole("combobox", { name: "Frequency" }).id).toBe(
      "explicit-frequency",
    );
  });
});

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
    const { view } = renderModal();
    const dialog = view.getByRole("dialog", { name: "Focus test" });
    expect(document.activeElement).toBe(dialog);
    expect(
      document.getElementById(dialog.getAttribute("aria-labelledby") ?? "")
        ?.textContent,
    ).toBe("Focus test");
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

  it("recaptures Tab into the panel when focus has escaped it", () => {
    // getAllByRole queries baseElement (document.body) and would see the
    // outside button too — query the recapture targets by name.
    const outside = document.createElement("button");
    document.body.append(outside);
    const { view } = renderModal();
    outside.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(
      view.getByRole("button", { name: "Close modal" }),
    );
    outside.remove();
  });

  it("recaptures Shift+Tab to the last focusable when focus has escaped", () => {
    const outside = document.createElement("button");
    document.body.append(outside);
    const { view } = renderModal();
    outside.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(
      view.getByRole("button", { name: "second" }),
    );
    outside.remove();
  });

  it("pins focus to the panel when no focusable element remains", () => {
    // The handler queries live DOM per keydown, so content that loses its
    // focusables dynamically hits the fallback (Close normally prevents this).
    const { view } = renderModal();
    const panel = view.getByRole("dialog");
    view.getByRole("button", { name: "first" }).focus();
    for (const button of panel.querySelectorAll("button")) {
      button.remove();
    }
    expect(document.activeElement).not.toBe(panel);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(panel);
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
      mode="tabs"
      onValueChange={setValue}
      tabs={[
        { label: "A", value: "a" },
        { label: "B", value: "b" },
        { label: "C", value: "c" },
      ]}
      value={value}
    >
      <p>{`Panel ${value.toUpperCase()}`}</p>
    </Tabs>
  );
}

describe("Tabs keyboard behavior", () => {
  it("gives only the active tab tabIndex 0", () => {
    const view = render(<TabsHarness />);
    const tabs = view.getAllByRole("tab");
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
  });

  it("keeps the first tab reachable when value matches no tab", () => {
    const view = render(
      <Tabs
        aria-label="Demo"
        mode="tabs"
        onValueChange={vi.fn()}
        tabs={[
          { label: "A", value: "a" },
          { label: "B", value: "b" },
        ]}
        value="missing"
      >
        Missing panel
      </Tabs>,
    );
    const tabs = view.getAllByRole("tab");
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1]);
    expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual([
      "true",
      "false",
    ]);
    const panel = view.getByRole("tabpanel", { name: "A" });
    expect(
      tabs.every((tab) => tab.getAttribute("aria-controls") === panel.id),
    ).toBe(true);
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

  it("connects tabs and the active panel in both directions", () => {
    const view = render(<TabsHarness />);
    const tabs = view.getAllByRole("tab");
    const panel = view.getByRole("tabpanel", { name: "A" });

    expect(
      tabs.every((tab) => tab.getAttribute("aria-controls") === panel.id),
    ).toBe(true);
    expect(panel.getAttribute("aria-labelledby")).toBe(tabs[0].id);

    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(view.getByRole("tabpanel", { name: "B" }).textContent).toContain(
      "Panel B",
    );
  });

  it("uses selection-group semantics when no panel is supplied", () => {
    const view = render(
      <Tabs
        aria-label="Filters"
        mode="selection"
        onValueChange={vi.fn()}
        tabs={[
          { label: "All", value: "all" },
          { label: "Open", value: "open" },
        ]}
        value="all"
      />,
    );
    const group = view.getByRole("group", { name: "Filters" });
    const buttons = Array.from(group.querySelectorAll("button"));

    expect(
      buttons.map((button) => button.getAttribute("aria-pressed")),
    ).toEqual(["true", "false"]);
    expect(view.queryByRole("tabpanel")).toBeNull();
  });

  it("renders no dangling relationships for an empty tab interface", () => {
    const view = render(
      <Tabs
        aria-label="Empty"
        mode="tabs"
        onValueChange={vi.fn()}
        tabs={[]}
        value="missing"
      >
        Nothing selected
      </Tabs>,
    );

    expect(view.queryByRole("tab")).toBeNull();
    expect(view.queryByRole("tabpanel")).toBeNull();
  });
});
