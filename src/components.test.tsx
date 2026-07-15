import { Children, isValidElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  AppFrame,
  Button,
  ButtonLink,
  Card,
  Metric,
  Modal,
  ProgressSteps,
  SelectField,
  StatusPill,
  Tabs,
  TextField,
} from "./components";

describe("component primitives", () => {
  it("renders buttons with variant, icon, default type, and label structure", () => {
    const html = renderToStaticMarkup(
      <Button icon={<span data-icon="plus" />} variant="primary">
        Add item
      </Button>,
    );

    expect(html).toContain('class="m-button m-button--primary"');
    expect(html).toContain('type="button"');
    expect(html).toContain('class="m-button__icon"');
    expect(html).toContain('class="m-button__label"');
    expect(html).toContain("Add item");
  });

  it("renders ButtonLink as an anchor with button styling", () => {
    const html = renderToStaticMarkup(
      <ButtonLink
        href="/docs"
        icon={<span data-icon="book" />}
        variant="primary"
      >
        Read the docs
      </ButtonLink>,
    );

    expect(html).toContain("<a ");
    expect(html).toContain('href="/docs"');
    expect(html).toContain('class="m-button m-button--primary"');
    expect(html).toContain('class="m-button__icon"');
    expect(html).toContain('class="m-button__label"');
    expect(html).not.toContain("type=");
  });

  it("renders cards, metrics, status pills, and app frame regions", () => {
    const html = renderToStaticMarkup(
      <AppFrame header={<span>Header</span>} nav={<a href="/">Home</a>}>
        <Card actions={<Button>Open</Button>} eyebrow="Home" title="Dashboard">
          <dl>
            <Metric label="Due" value="3" />
          </dl>
          <StatusPill tone="warning">Due soon</StatusPill>
        </Card>
      </AppFrame>,
    );

    expect(html).toContain('class="m-app-frame"');
    expect(html).toContain('class="m-app-frame__header"');
    expect(html).toContain('class="m-app-frame__nav"');
    expect(html).toContain('class="m-card__header"');
    expect(html).toContain('class="m-eyebrow"');
    expect(html).toContain('class="m-metric"');
    expect(html).toContain('class="m-status-pill m-status-pill--warning"');
  });

  it("lays AppFrame out single-column unless a sidebar is provided", () => {
    const withSidebar = renderToStaticMarkup(
      <AppFrame sidebar={<span>Nav</span>}>Content</AppFrame>,
    );
    const withoutSidebar = renderToStaticMarkup(<AppFrame>Content</AppFrame>);

    expect(withSidebar).toContain('class="m-app-frame m-app-frame--sidebar"');
    expect(withSidebar).toContain('class="m-app-frame__sidebar"');
    expect(withoutSidebar).toContain('class="m-app-frame"');
    expect(withoutSidebar).not.toContain("m-app-frame--sidebar");
    expect(withoutSidebar).not.toContain("m-app-frame__sidebar");
  });

  it("renders form fields with labels, help text, errors, and native attributes", () => {
    const html = renderToStaticMarkup(
      <>
        <TextField
          error="Required"
          helpText="Use the common name."
          label="Item"
          name="item"
          required
        />
        <SelectField label="Frequency" name="frequency" defaultValue="monthly">
          <option value="monthly">Monthly</option>
        </SelectField>
      </>,
    );

    expect(html).toContain('class="m-field__label"');
    expect(html).toContain('class="m-input"');
    expect(html).toContain('name="item"');
    expect(html).toContain("required");
    expect(html).toContain('class="m-field__help"');
    expect(html).toContain('class="m-field__error"');
    expect(html).toContain('class="m-input m-input--select"');
  });

  it("renders tabs with accessible tablist state and emits selected values", () => {
    const onValueChange = vi.fn();
    const element = (
      <Tabs
        aria-label="Sections"
        onValueChange={onValueChange}
        tabs={[
          { label: "Home", value: "home" },
          { label: "Personal", value: "personal" },
        ]}
        value="home"
      />
    );
    const html = renderToStaticMarkup(element);

    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="Sections"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('aria-selected="false"');

    const rendered = Tabs({
      "aria-label": "Sections",
      onValueChange,
      tabs: [
        { label: "Home", value: "home" },
        { label: "Personal", value: "personal" },
      ],
      value: "home",
    });
    const buttons = isValidElement<{ children: ReactNode }>(rendered)
      ? Children.toArray(rendered.props.children)
      : [];
    const personalButton = buttons[1];

    expect(isValidElement(personalButton)).toBe(true);
    if (isValidElement<{ onClick: () => void }>(personalButton)) {
      personalButton.props.onClick();
    }
    expect(onValueChange).toHaveBeenCalledWith("personal");
  });

  it("renders progress and modal accessibility semantics", () => {
    const onClose = vi.fn();
    const openHtml = renderToStaticMarkup(
      <>
        <ProgressSteps current={1} steps={["Profile", "Home", "Done"]} />
        <Modal
          actions={<Button>Save</Button>}
          onClose={onClose}
          open
          title="Quick add"
        >
          Modal body
        </Modal>
      </>,
    );
    const closedHtml = renderToStaticMarkup(
      <Modal onClose={onClose} open={false} title="Closed">
        Hidden
      </Modal>,
    );

    expect(openHtml).toContain('aria-label="Progress"');
    expect(openHtml).toContain('aria-current="step"');
    expect(openHtml).toContain('role="dialog"');
    expect(openHtml).toContain('aria-modal="true"');
    expect(openHtml).toContain("Quick add");
    expect(closedHtml).toBe("");
  });
});
