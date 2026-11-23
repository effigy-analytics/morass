// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyField } from "./components";

function stubClipboard(writeText: ((text: string) => Promise<void>) | null) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  stubClipboard(null);
});

describe("CopyField", () => {
  it("renders a labelled, read-only, selectable value with a copy button", () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const view = render(<CopyField label="Invite link" value="abc-123" />);
    const input = view.getByRole("textbox", {
      name: "Invite link",
    }) as HTMLInputElement;

    expect(input.value).toBe("abc-123");
    expect(input.readOnly).toBe(true);
    expect(view.getByRole("button", { name: "Copy" })).toBeTruthy();
  });

  it("writes the value to the clipboard and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const onCopyResult = vi.fn();
    const view = render(
      <CopyField label="Key" onCopyResult={onCopyResult} value="secret" />,
    );

    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy" }));
    });

    expect(writeText).toHaveBeenCalledWith("secret");
    expect(view.getByRole("status").textContent).toBe("Copied");
    expect(view.getByRole("button", { name: "Copied" })).toBeTruthy();
    expect(onCopyResult).toHaveBeenCalledWith("copied");
  });

  it("keeps a polite live region mounted before any interaction", () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const view = render(<CopyField label="Key" value="v" />);
    const status = view.getByRole("status");

    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toBe("");
    expect(view.getByRole("textbox").getAttribute("aria-describedby")).toBe(
      status.id,
    );
  });

  it("resets the copied state after the delay", async () => {
    vi.useFakeTimers();
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const view = render(<CopyField label="Key" resetDelay={500} value="v" />);

    await act(async () => {
      fireEvent.click(view.getByRole("button"));
    });
    expect(view.getByRole("status").textContent).toBe("Copied");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(view.getByRole("status").textContent).toBe("");
    expect(view.getByRole("button", { name: "Copy" })).toBeTruthy();
  });

  it("explains manual copying and selects the value when the clipboard rejects", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("NotAllowedError")));
    const onCopyResult = vi.fn();
    const view = render(
      <CopyField label="Key" onCopyResult={onCopyResult} value="secret" />,
    );
    const input = view.getByRole("textbox") as HTMLInputElement;

    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy" }));
    });

    expect(view.getByRole("status").textContent).toMatch(/Ctrl\+C or Cmd\+C/);
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe("secret".length);
    expect(view.getByRole("button", { name: "Copy" })).toBeTruthy();
    expect(onCopyResult).toHaveBeenCalledWith("denied");
  });

  it("falls back to manual instructions when the Clipboard API is unavailable", async () => {
    stubClipboard(null);
    const view = render(<CopyField label="Key" value="secret" />);

    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy" }));
    });

    expect(view.getByRole("status").textContent).toMatch(/blocked/);
    expect(view.container.querySelector(".m-copy-field--denied")).toBeTruthy();
  });

  it("recovers from a denied attempt on a later successful copy", async () => {
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new Error("denied"))
      .mockResolvedValueOnce(undefined);
    stubClipboard(writeText);
    const view = render(<CopyField label="Key" value="v" />);

    await act(async () => {
      fireEvent.click(view.getByRole("button"));
    });
    expect(view.getByRole("status").textContent).toMatch(/blocked/);

    await act(async () => {
      fireEvent.click(view.getByRole("button"));
    });
    expect(view.getByRole("status").textContent).toBe("Copied");
  });

  it("supports custom labels and messages", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("no")));
    const view = render(
      <CopyField
        copyLabel="Copy link"
        copiedLabel="Link copied"
        deniedLabel="Select the link and copy it yourself."
        label="Link"
        value="https://example.com"
      />,
    );

    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy link" }));
    });
    expect(view.getByRole("status").textContent).toBe(
      "Select the link and copy it yourself.",
    );

    stubClipboard(vi.fn().mockResolvedValue(undefined));
    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy link" }));
    });
    expect(view.getByRole("status").textContent).toBe("Link copied");
    expect(view.getByRole("button", { name: "Link copied" })).toBeTruthy();
  });

  it("clears stale status when the value changes", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const view = render(<CopyField label="Key" value="one" />);

    await act(async () => {
      fireEvent.click(view.getByRole("button"));
    });
    expect(view.getByRole("status").textContent).toBe("Copied");

    view.rerender(<CopyField label="Key" value="two" />);
    expect(view.getByRole("status").textContent).toBe("");
  });

  it("is reachable and operable from the keyboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const view = render(<CopyField label="Key" value="v" />);
    const input = view.getByRole("textbox");
    const button = view.getByRole("button");

    input.focus();
    expect(document.activeElement).toBe(input);
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("type")).toBe("button");

    await act(async () => {
      button.click();
    });
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  it("generates unique identifiers and forwards container attributes", () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const view = render(
      <>
        <CopyField className="extra" data-testid="one" label="A" value="a" />
        <CopyField label="B" value="b" />
      </>,
    );
    const [a, b] = view.getAllByRole("textbox");

    expect(a?.id).not.toBe(b?.id);
    expect(view.getByTestId("one").className).toContain("extra");
  });
});
