import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  AppFrame,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Hero,
  Metric,
  Modal,
  NotFound,
  PageHeader,
  PageSection,
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

  it("renders a Card footer slot only when provided", () => {
    const withFooter = renderToStaticMarkup(
      <Card footer={<a href="/more">Read more</a>} title="Teaser">
        Body
      </Card>,
    );
    const withoutFooter = renderToStaticMarkup(<Card title="Plain">Body</Card>);

    expect(withFooter).toContain('class="m-card__footer"');
    expect(withFooter).toContain("Read more");
    expect(withoutFooter).not.toContain("m-card__footer");
  });

  it("renders Card subtitle and flushes body padding with noPadding", () => {
    const withExtras = renderToStaticMarkup(
      <Card noPadding subtitle="Under the title" title="Report">
        Body
      </Card>,
    );
    expect(withExtras).toContain(
      '<p class="m-card__subtitle">Under the title</p>',
    );
    expect(withExtras).toContain('class="m-card__body m-card__body--flush"');

    const plain = renderToStaticMarkup(<Card title="Report">Body</Card>);
    expect(plain).not.toContain("m-card__subtitle");
    expect(plain).toContain('class="m-card__body"');
    expect(plain).not.toContain("m-card__body--flush");
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

  it("renders Hero with eyebrow, title, lede, and actions", () => {
    const html = renderToStaticMarkup(
      <Hero
        actions={<ButtonLink href="/start">Get started</ButtonLink>}
        eyebrow="A two-person studio"
        id="top"
        lede="Things made by people, for people."
        title={
          <>
            Software for <em>humans</em>.
          </>
        }
      />,
    );

    expect(html).toContain('class="m-hero"');
    expect(html).toContain('id="top"');
    expect(html).toContain('class="m-eyebrow"');
    expect(html).toContain('<h1 class="m-hero__title">');
    expect(html).toContain("<em>humans</em>");
    expect(html).toContain('class="m-hero__lede"');
    expect(html).toContain('class="m-hero__actions"');
  });

  it("renders a PageHeader with title, subtitle, breadcrumbs, and actions", () => {
    const html = renderToStaticMarkup(
      <PageHeader
        actions={<button>New</button>}
        breadcrumbs={<nav>Home / Reports</nav>}
        subtitle="Last 30 days"
        title="Reports"
      />,
    );
    expect(html).toContain('class="m-page-header"');
    expect(html).toContain('class="m-page-header__breadcrumbs"');
    expect(html).toContain('<h1 class="m-page-header__title">Reports</h1>');
    expect(html).toContain('class="m-page-header__subtitle"');
    expect(html).toContain('class="m-page-header__actions"');
  });

  it("omits PageHeader optional slots when not provided", () => {
    const html = renderToStaticMarkup(<PageHeader title="Bare" />);
    expect(html).toContain('class="m-page-header"');
    expect(html).not.toContain("m-page-header__breadcrumbs");
    expect(html).not.toContain("m-page-header__subtitle");
    expect(html).not.toContain("m-page-header__actions");
  });

  it("renders an EmptyState on a paper surface with icon, title, description, action", () => {
    const html = renderToStaticMarkup(
      <EmptyState
        action={<button>Add one</button>}
        description="Nothing here yet."
        icon={<span data-icon="box" />}
        title="No reports"
      />,
    );
    expect(html).toContain('class="m-empty-state m-paper"');
    expect(html).toContain('class="m-empty-state__icon"');
    expect(html).toContain('<h3 class="m-empty-state__title">No reports</h3>');
    expect(html).toContain('class="m-empty-state__description"');
    expect(html).toContain('class="m-empty-state__action"');
  });

  it("omits EmptyState optional slots when not provided", () => {
    const html = renderToStaticMarkup(<EmptyState title="Empty" />);
    expect(html).not.toContain("m-empty-state__icon");
    expect(html).not.toContain("m-empty-state__description");
    expect(html).not.toContain("m-empty-state__action");
  });

  it("renders tabs with accessible tablist state", () => {
    const element = (
      <Tabs
        aria-label="Sections"
        onValueChange={() => {}}
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
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('tabindex="-1"');
  });

  it("renders PageSection with optional label and attribute passthrough", () => {
    const withLabel = renderToStaticMarkup(
      <PageSection id="work" label="What we make">
        <p>Cards</p>
      </PageSection>,
    );
    const bare = renderToStaticMarkup(<PageSection>Just content</PageSection>);

    expect(withLabel).toContain('class="m-page-section"');
    expect(withLabel).toContain('id="work"');
    expect(withLabel).toContain('class="m-eyebrow"');
    expect(withLabel).toContain("What we make");
    expect(bare).not.toContain("m-eyebrow");
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

  it("renders NotFound with defaults and a fallback home link", () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toContain('class="m-not-found"');
    expect(html).toContain('role="status"');
    expect(html).toContain('class="m-not-found__heading">Page Not Found</h1>');
    expect(html).toContain("exist or has been moved"); // apostrophe is escaped in static markup — match a clean substring
    expect(html).toContain('class="m-not-found__home" href="/"');
  });

  it("renders NotFound with custom heading, message, and action", () => {
    const html = renderToStaticMarkup(
      <NotFound
        action={<a href="/back">Go back</a>}
        heading="Gone"
        message="Missing."
      />,
    );
    expect(html).toContain(">Gone</h1>");
    expect(html).toContain("Missing.");
    expect(html).toContain("Go back");
    expect(html).not.toContain('class="m-not-found__home"');
  });
});
