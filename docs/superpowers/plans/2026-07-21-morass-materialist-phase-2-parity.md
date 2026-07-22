# morass Materialist — Phase 2 (Parity Components) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add the three components (`PageHeader`, `EmptyState`, `NotFound`) that the four frozen effigy-ui consumers actually import but morass lacks — styled in the craft-material system — so effigy-ui can be deprecated.

**Architecture:** morass ships React components in `src/components.tsx` (named `export function`, `cx()` for classNames, BEM `m-*` classes, props interfaces `extends Omit<HTMLAttributes<HTMLElement>, "title">` when they carry a `title`), styled in `src/styles.css` inside `@layer morass` (token-only), tested in `src/components.test.tsx` via `renderToStaticMarkup` + HTML-string assertions. This plan adds three components following those exact patterns and consuming the Phase 1 material treatments/tokens. `src/index.ts` already re-exports everything via `export * from "./components"` — no export change needed.

**Tech Stack:** React, TypeScript, CSS custom properties, Vitest, `react-dom/server`.

## Global Constraints

- Component conventions: `export function Name({ …alphaSortedProps }: NameProps)`; use `cx(...)` from `./utils` for `className`; spread `{...props}`; conditional slots render `? … : null`. Match the existing `Card`/`Hero` style in `src/components.tsx`.
- Prop **names** mirror effigy-ui exactly (so consumers migrate by swapping the import): `PageHeader{ title, subtitle?, breadcrumbs?, actions? }`, `EmptyState{ title, description?, action?, icon? }`, `NotFound{ heading?, message?, action? }`. `title` is `ReactNode` and required for PageHeader/EmptyState.
- All CSS inside the single `@layer morass { … }`; **raw colors only in the three token blocks** — every new rule references `var(--m-*)` tokens only.
- Tests use `renderToStaticMarkup` and assert on the HTML string (classes, structure, content), matching `src/components.test.tsx`.
- Run focused tests while iterating (`npm run test -- components`); run the full gate `npm run check` (format + lint + typecheck + test + build + pack) once before committing each task. Prettier must be clean — run `npx prettier --write` on touched files before committing.
- Commit after every task.

---

### Task 1: PageHeader

**Files:**

- Modify: `src/components.tsx` (add `PageHeaderProps` + `PageHeader`)
- Modify: `src/styles.css` (add `.m-page-header*` rules inside `@layer morass`)
- Test: `src/components.test.tsx` (add a PageHeader case; add `PageHeader` to the import list)

**Interfaces:**

- Produces: `export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> { actions?: ReactNode; breadcrumbs?: ReactNode; subtitle?: ReactNode; title: ReactNode; }` and `export function PageHeader(props: PageHeaderProps): JSX.Element`.

- [ ] **Step 1: Write the failing test** — add `PageHeader` to the existing import from `./components` at the top of `src/components.test.tsx`, then add inside `describe("component primitives", …)`:

```tsx
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
```

- [ ] **Step 2: Run to verify it fails** — `npm run test -- components` — Expected: FAIL (`PageHeader` is not exported / undefined).

- [ ] **Step 3: Implement the component** — add to `src/components.tsx` (near `Hero`, keeping exports grouped sensibly):

```tsx
export interface PageHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
}

export function PageHeader({
  actions,
  breadcrumbs,
  className,
  subtitle,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header className={cx("m-page-header", className)} {...props}>
      <div className="m-page-header__main">
        {breadcrumbs ? (
          <div className="m-page-header__breadcrumbs">{breadcrumbs}</div>
        ) : null}
        <h1 className="m-page-header__title">{title}</h1>
        {subtitle ? (
          <p className="m-page-header__subtitle">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="m-page-header__actions">{actions}</div> : null}
    </header>
  );
}
```

- [ ] **Step 4: Add the styles** — append inside `@layer morass` in `src/styles.css`:

```css
.m-page-header {
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  padding: 24px 0 16px;
}

.m-page-header__main {
  min-width: 0;
}

.m-page-header__breadcrumbs {
  color: var(--m-color-text-muted);
  font-size: 0.8rem;
  margin-bottom: 6px;
}

.m-page-header__title {
  font-size: 1.6rem;
  line-height: 1.15;
  margin: 0;
}

.m-page-header__subtitle {
  color: var(--m-color-text-muted);
  font-size: 0.95rem;
  margin: 6px 0 0;
  max-width: 60ch;
}

.m-page-header__actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
```

- [ ] **Step 5: Verify** — `npx prettier --write src/components.tsx src/styles.css src/components.test.tsx`, then `npm run check` — Expected: PASS (all suites green, prettier clean, build + pack ok).

- [ ] **Step 6: Commit**

```bash
git add src/components.tsx src/styles.css src/components.test.tsx
git commit -m "feat(morass): PageHeader component (effigy-ui parity)"
```

---

### Task 2: EmptyState (paper treatment)

**Files:**

- Modify: `src/components.tsx` (add `EmptyStateProps` + `EmptyState`)
- Modify: `src/styles.css` (add `.m-empty-state*` rules)
- Test: `src/components.test.tsx` (add case; add `EmptyState` to imports)

**Interfaces:**

- Produces: `export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLElement>, "title"> { action?: ReactNode; description?: ReactNode; icon?: ReactNode; title: ReactNode; }` and `export function EmptyState(props: EmptyStateProps): JSX.Element`. (effigy-ui typed `description` as `string`; widen to `ReactNode` — still accepts strings, more flexible.)

- [ ] **Step 1: Write the failing test** — add `EmptyState` to the import list, then:

```tsx
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
```

- [ ] **Step 2: Run to verify it fails** — `npm run test -- components` — Expected: FAIL (`EmptyState` undefined).

- [ ] **Step 3: Implement the component** — add to `src/components.tsx`. Note it composes the Phase 1 `m-paper` treatment (its material role is content/paper):

```tsx
export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  action?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
}

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cx("m-empty-state", "m-paper", className)} {...props}>
      {icon ? <div className="m-empty-state__icon">{icon}</div> : null}
      <h3 className="m-empty-state__title">{title}</h3>
      {description ? (
        <p className="m-empty-state__description">{description}</p>
      ) : null}
      {action ? <div className="m-empty-state__action">{action}</div> : null}
    </div>
  );
}
```

- [ ] **Step 4: Add the styles** — append inside `@layer morass` (`.m-paper` already supplies surface/shadow/radius; this adds the empty-state layout):

```css
.m-empty-state {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 40px 24px;
  text-align: center;
}

.m-empty-state__icon {
  color: var(--m-color-text-muted);
  font-size: 1.75rem;
}

.m-empty-state__title {
  font-size: 1.1rem;
  margin: 0;
}

.m-empty-state__description {
  color: var(--m-color-text-muted);
  margin: 0;
  max-width: 44ch;
}

.m-empty-state__action {
  margin-top: 6px;
}
```

- [ ] **Step 5: Verify** — `npx prettier --write src/components.tsx src/styles.css src/components.test.tsx`, then `npm run check` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components.tsx src/styles.css src/components.test.tsx
git commit -m "feat(morass): EmptyState component on paper treatment (effigy-ui parity)"
```

---

### Task 3: NotFound

**Files:**

- Modify: `src/components.tsx` (add `NotFoundProps` + `NotFound`)
- Modify: `src/styles.css` (add `.m-not-found*` rules)
- Test: `src/components.test.tsx` (add case; add `NotFound` to imports)

**Interfaces:**

- Produces: `export interface NotFoundProps { action?: ReactNode; heading?: string; message?: string; }` and `export function NotFound(props: NotFoundProps): JSX.Element`. Defaults: `heading = "Page Not Found"`, `message = "The page you're looking for doesn't exist or has been moved."`. Falls back to a `Return home` anchor when no `action`.

- [ ] **Step 1: Write the failing test** — add `NotFound` to the import list, then:

```tsx
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
```

- [ ] **Step 2: Run to verify it fails** — `npm run test -- components` — Expected: FAIL (`NotFound` undefined).

- [ ] **Step 3: Implement the component** — add to `src/components.tsx`:

```tsx
export interface NotFoundProps {
  action?: ReactNode;
  heading?: string;
  message?: string;
}

export function NotFound({
  action,
  heading = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
}: NotFoundProps) {
  return (
    <div className="m-not-found" role="status">
      <h1 className="m-not-found__heading">{heading}</h1>
      <p className="m-not-found__message">{message}</p>
      <div className="m-not-found__action">
        {action ?? (
          <a className="m-not-found__home" href="/">
            Return home
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add the styles** — append inside `@layer morass`:

```css
.m-not-found {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 72px 24px;
  text-align: center;
}

.m-not-found__heading {
  font-size: 1.8rem;
  margin: 0;
}

.m-not-found__message {
  color: var(--m-color-text-muted);
  margin: 0;
  max-width: 48ch;
}

.m-not-found__action {
  margin-top: 10px;
}

.m-not-found__home {
  color: var(--m-color-primary);
  font-weight: 700;
}
```

- [ ] **Step 5: Verify** — `npx prettier --write src/components.tsx src/styles.css src/components.test.tsx`, then `npm run check` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components.tsx src/styles.css src/components.test.tsx
git commit -m "feat(morass): NotFound 404 component (effigy-ui parity)"
```

---

## Phase-2 exit check

- [ ] `npm run check` green (format + lint + typecheck + tests + build + pack).
- [ ] `PageHeader`, `EmptyState`, `NotFound` exported from the package (via `index.ts` → `components`).
- [ ] Prop names match effigy-ui so consumer migration is an import swap.
- [ ] New CSS references tokens only; all inside `@layer morass`.

**Follow-on (separate work):** migrate the 4 consumers (awards, fiscally, steam-sage, declassify) from `@effigy-analytics/effigy-ui` → morass (import swaps + `ShellLayout`→`AppFrame` and the custom link-renderer for fiscally + CSS entry `styles.css`), verify each, then archive effigy-ui at zero consumers. Also the broader restyle of the existing 13 components onto treatments + per-component `material → role` assertions remains queued.
