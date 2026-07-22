import { useEffect, useId, useInsertionEffect, useRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  LabelHTMLAttributes,
  ReactElement,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cx, toneClass, type Tone } from "./utils.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function mergeAriaIds(
  ...values: Array<string | undefined>
): string | undefined {
  const ids = values.flatMap(
    (value) => value?.split(/\s+/).filter(Boolean) ?? [],
  );
  return ids.length > 0 ? [...new Set(ids)].join(" ") : undefined;
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: ButtonVariant;
}

export function Button({
  children,
  className,
  icon,
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      className={cx("m-button", `m-button--${variant}`, className)}
      type={type}
      {...props}
    >
      {icon ? <span className="m-button__icon">{icon}</span> : null}
      {children ? <span className="m-button__label">{children}</span> : null}
    </button>
  );
}

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: ReactNode;
  variant?: ButtonVariant;
}

export function ButtonLink({
  children,
  className,
  icon,
  variant = "secondary",
  ...props
}: ButtonLinkProps): ReactElement {
  return (
    <a className={cx("m-button", `m-button--${variant}`, className)} {...props}>
      {icon ? <span className="m-button__icon">{icon}</span> : null}
      {children ? <span className="m-button__label">{children}</span> : null}
    </a>
  );
}

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  actions?: ReactNode;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  /** Remove the body's internal padding (for flush content like tables). */
  noPadding?: boolean;
  /** Descriptive text shown under the title. */
  subtitle?: ReactNode;
  title?: ReactNode;
}

export function Card({
  actions,
  children,
  className,
  eyebrow,
  footer,
  noPadding,
  subtitle,
  title,
  ...props
}: CardProps): ReactElement {
  return (
    <section className={cx("m-card", className)} {...props}>
      {eyebrow || title || subtitle || actions ? (
        <header className="m-card__header">
          <div>
            {eyebrow ? <p className="m-eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="m-card__title">{title}</h2> : null}
            {subtitle ? <p className="m-card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="m-card__actions">{actions}</div> : null}
        </header>
      ) : null}
      {children ? (
        <div className={cx("m-card__body", noPadding && "m-card__body--flush")}>
          {children}
        </div>
      ) : null}
      {footer ? <footer className="m-card__footer">{footer}</footer> : null}
    </section>
  );
}

export interface AppFrameProps {
  children: ReactNode;
  header?: ReactNode;
  nav?: ReactNode;
  sidebar?: ReactNode;
}

export function AppFrame({
  children,
  header,
  nav,
  sidebar,
}: AppFrameProps): ReactElement {
  return (
    <div
      className={cx("m-app-frame", Boolean(sidebar) && "m-app-frame--sidebar")}
    >
      {sidebar ? (
        <aside className="m-app-frame__sidebar">{sidebar}</aside>
      ) : null}
      <div className="m-app-frame__main">
        {header ? (
          <header className="m-app-frame__header">{header}</header>
        ) : null}
        <main className="m-app-frame__content">{children}</main>
        {nav ? <nav className="m-app-frame__nav">{nav}</nav> : null}
      </div>
    </div>
  );
}

const HIDDEN_ENVIRONMENTS = new Set(["", "prod", "production"]);

export interface ShellLayoutProps {
  /** Header-right actions (e.g. a user menu). */
  actions?: ReactNode;
  /** Brand / app name shown at the header start. */
  appName: ReactNode;
  children: ReactNode;
  /** Environment name; shown as a felt pill unless prod/empty. */
  environment?: string;
  /** Primary navigation — pass your router's links (e.g. `NavLink`). */
  nav?: ReactNode;
}

/**
 * Opinionated Effigy app shell: a materialist header (brand, environment
 * pill, nav, actions) over an AppFrame. This is how Effigy sites are
 * structured; apps supply their own router links via `nav`.
 */
export function ShellLayout({
  actions,
  appName,
  children,
  environment,
  nav,
}: ShellLayoutProps): ReactElement {
  const showEnvironment =
    environment !== undefined && !HIDDEN_ENVIRONMENTS.has(environment);
  const header = (
    <>
      <span className="m-shell__brand">{appName}</span>
      {showEnvironment ? (
        <span className="m-shell__env m-felt m-felt--butter m-stitch">
          {environment}
        </span>
      ) : null}
      {nav ? <nav className="m-shell__nav">{nav}</nav> : null}
      {actions ? <div className="m-shell__actions">{actions}</div> : null}
    </>
  );
  return <AppFrame header={header}>{children}</AppFrame>;
}

export interface HeroProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  actions?: ReactNode;
  eyebrow?: ReactNode;
  lede?: ReactNode;
  title: ReactNode;
}

export function Hero({
  actions,
  children,
  className,
  eyebrow,
  lede,
  title,
  ...props
}: HeroProps): ReactElement {
  return (
    <section className={cx("m-hero", className)} {...props}>
      {eyebrow ? <p className="m-eyebrow">{eyebrow}</p> : null}
      <h1 className="m-hero__title">{title}</h1>
      {lede ? <p className="m-hero__lede">{lede}</p> : null}
      {actions ? <div className="m-hero__actions">{actions}</div> : null}
      {children}
    </section>
  );
}

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
}: PageHeaderProps): ReactElement {
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
}: EmptyStateProps): ReactElement {
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

export interface NotFoundProps {
  action?: ReactNode;
  heading?: string;
  message?: string;
}

export function NotFound({
  action,
  heading = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
}: NotFoundProps): ReactElement {
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

export interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  label?: ReactNode;
}

export function PageSection({
  children,
  className,
  label,
  ...props
}: PageSectionProps): ReactElement {
  return (
    <section className={cx("m-page-section", className)} {...props}>
      {label ? <p className="m-eyebrow">{label}</p> : null}
      {children}
    </section>
  );
}

export interface FieldProps {
  error?: ReactNode;
  helpText?: ReactNode;
  label: ReactNode;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
}

export interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement>, FieldProps {}

export function TextField({
  error,
  helpText,
  label,
  labelProps,
  ...props
}: TextFieldProps): ReactElement {
  const generatedId = useId();
  const controlId = props.id ?? labelProps?.htmlFor ?? `m-field-${generatedId}`;
  const helpId = helpText ? `${controlId}-help` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  return (
    <div className="m-field">
      <label
        {...labelProps}
        className={cx("m-field__label", labelProps?.className)}
        htmlFor={controlId}
      >
        {label}
      </label>
      <input
        {...props}
        aria-describedby={mergeAriaIds(
          props["aria-describedby"],
          helpId,
          errorId,
        )}
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cx("m-input", props.className)}
        id={controlId}
      />
      {helpText ? (
        <span className="m-field__help" id={helpId}>
          {helpText}
        </span>
      ) : null}
      {error ? (
        <span className="m-field__error" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement>, FieldProps {}

export function SelectField({
  children,
  error,
  helpText,
  label,
  labelProps,
  ...props
}: SelectFieldProps): ReactElement {
  const generatedId = useId();
  const controlId = props.id ?? labelProps?.htmlFor ?? `m-field-${generatedId}`;
  const helpId = helpText ? `${controlId}-help` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  return (
    <div className="m-field">
      <label
        {...labelProps}
        className={cx("m-field__label", labelProps?.className)}
        htmlFor={controlId}
      >
        {label}
      </label>
      <select
        {...props}
        aria-describedby={mergeAriaIds(
          props["aria-describedby"],
          helpId,
          errorId,
        )}
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cx("m-input", "m-input--select", props.className)}
        id={controlId}
      >
        {children}
      </select>
      {helpText ? (
        <span className="m-field__help" id={helpId}>
          {helpText}
        </span>
      ) : null}
      {error ? (
        <span className="m-field__error" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

export interface StatusPillProps {
  children: ReactNode;
  tone?: Tone;
}

export function StatusPill({
  children,
  tone = "neutral",
}: StatusPillProps): ReactElement {
  return <span className={toneClass("m-status-pill", tone)}>{children}</span>;
}

export interface MetricProps {
  label: ReactNode;
  value: ReactNode;
}

export function Metric({ label, value }: MetricProps): ReactElement {
  return (
    <div className="m-metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

interface TabsBaseProps<TValue extends string> {
  "aria-label": string;
  onValueChange: (value: TValue) => void;
  tabs: Array<{ label: ReactNode; value: TValue }>;
  value: TValue;
}

export type TabsProps<TValue extends string> = TabsBaseProps<TValue> &
  (
    | {
        /** A linked tablist and active tabpanel. */
        children: ReactNode;
        mode: "tabs";
      }
    | {
        /** Filter-like selection buttons that control consumer-owned content. */
        children?: never;
        mode: "selection";
      }
  );

export function Tabs<TValue extends string>({
  "aria-label": ariaLabel,
  children,
  mode,
  onValueChange,
  tabs,
  value,
}: TabsProps<TValue>): ReactElement {
  const generatedId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = tabs.findIndex((tab) => tab.value === value);
  const activeIndex =
    selectedIndex >= 0 ? selectedIndex : tabs.length > 0 ? 0 : -1;
  const hasPanel = mode === "tabs";
  const panelId = `m-tabs-${generatedId}-panel`;
  const tabId = (index: number) => `m-tabs-${generatedId}-tab-${index}`;

  const select = (index: number) => {
    tabRefs.current[index]?.focus();
    onValueChange(tabs[index].value);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (tabs.length === 0) {
      return;
    }
    let target: number | null = null;
    if (event.key === "ArrowRight") {
      target = (activeIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      target = (activeIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      target = 0;
    } else if (event.key === "End") {
      target = tabs.length - 1;
    }
    if (target !== null) {
      event.preventDefault();
      select(target);
    }
  };

  return (
    <>
      <div
        aria-label={ariaLabel}
        className="m-tabs"
        role={hasPanel ? "tablist" : "group"}
      >
        {tabs.map((tab, index) => {
          const isActive = hasPanel
            ? index === activeIndex
            : tab.value === value;
          return (
            <button
              aria-controls={hasPanel && activeIndex >= 0 ? panelId : undefined}
              aria-pressed={hasPanel ? undefined : isActive}
              aria-selected={hasPanel ? isActive : undefined}
              className={cx("m-tabs__tab", isActive && "m-tabs__tab--active")}
              id={hasPanel ? tabId(index) : undefined}
              key={tab.value}
              onClick={() => onValueChange(tab.value)}
              onKeyDown={handleKeyDown}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role={hasPanel ? "tab" : undefined}
              tabIndex={index === activeIndex ? 0 : -1}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {hasPanel && activeIndex >= 0 ? (
        <div
          aria-labelledby={tabId(activeIndex)}
          className="m-tabs__panel"
          id={panelId}
          role="tabpanel"
          tabIndex={0}
        >
          {children}
        </div>
      ) : null}
    </>
  );
}

export interface ProgressStepsProps {
  current: number;
  steps: string[];
}

export function ProgressSteps({
  current,
  steps,
}: ProgressStepsProps): ReactElement {
  return (
    <ol className="m-progress" aria-label="Progress">
      {steps.map((step, index) => (
        <li
          aria-current={index === current ? "step" : undefined}
          className={cx(
            "m-progress__step",
            index <= current && "m-progress__step--active",
          )}
          key={step}
        >
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
  );
}

export interface ModalProps {
  actions?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: ReactNode;
}

export function Modal({
  actions,
  children,
  onClose,
  open,
  title,
}: ModalProps): ReactElement | null {
  const titleId = `m-modal-title-${useId()}`;
  const panelRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  // Insertion effect, not passive: it flushes synchronously during commit,
  // so a keydown can never land between paint and the ref refresh and call
  // a stale onClose. (A passive effect flushes after paint; a render-phase
  // write breaks under concurrent rendering.)
  useInsertionEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    panelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const panel = panelRef.current;
      if (!panel) {
        return;
      }
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!(active instanceof Node) || !panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="m-modal" role="presentation">
      <div className="m-modal__backdrop" onClick={onClose} />
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="m-modal__panel"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="m-modal__header">
          <h2 id={titleId}>{title}</h2>
          <Button aria-label="Close modal" onClick={onClose} variant="ghost">
            Close
          </Button>
        </header>
        <div className="m-modal__body">{children}</div>
        {actions ? (
          <footer className="m-modal__actions">{actions}</footer>
        ) : null}
      </section>
    </div>
  );
}
