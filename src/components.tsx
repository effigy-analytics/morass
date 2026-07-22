import { useEffect, useInsertionEffect, useRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cx, toneClass, type Tone } from "./utils";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
}: ButtonProps) {
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
}: ButtonLinkProps) {
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
  title?: ReactNode;
}

export function Card({
  actions,
  children,
  className,
  eyebrow,
  footer,
  title,
  ...props
}: CardProps) {
  return (
    <section className={cx("m-card", className)} {...props}>
      {eyebrow || title || actions ? (
        <header className="m-card__header">
          <div>
            {eyebrow ? <p className="m-eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="m-card__title">{title}</h2> : null}
          </div>
          {actions ? <div className="m-card__actions">{actions}</div> : null}
        </header>
      ) : null}
      {children ? <div className="m-card__body">{children}</div> : null}
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

export function AppFrame({ children, header, nav, sidebar }: AppFrameProps) {
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
}: HeroProps) {
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

export interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  label?: ReactNode;
}

export function PageSection({
  children,
  className,
  label,
  ...props
}: PageSectionProps) {
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
}: TextFieldProps) {
  return (
    <label className="m-field" {...labelProps}>
      <span className="m-field__label">{label}</span>
      <input className="m-input" {...props} />
      {helpText ? <span className="m-field__help">{helpText}</span> : null}
      {error ? <span className="m-field__error">{error}</span> : null}
    </label>
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
}: SelectFieldProps) {
  return (
    <label className="m-field" {...labelProps}>
      <span className="m-field__label">{label}</span>
      <select className="m-input m-input--select" {...props}>
        {children}
      </select>
      {helpText ? <span className="m-field__help">{helpText}</span> : null}
      {error ? <span className="m-field__error">{error}</span> : null}
    </label>
  );
}

export interface StatusPillProps {
  children: ReactNode;
  tone?: Tone;
}

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return <span className={toneClass("m-status-pill", tone)}>{children}</span>;
}

export interface MetricProps {
  label: ReactNode;
  value: ReactNode;
}

export function Metric({ label, value }: MetricProps) {
  return (
    <div className="m-metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export interface TabsProps<TValue extends string> {
  "aria-label": string;
  onValueChange: (value: TValue) => void;
  tabs: Array<{ label: ReactNode; value: TValue }>;
  value: TValue;
}

export function Tabs<TValue extends string>({
  "aria-label": ariaLabel,
  onValueChange,
  tabs,
  value,
}: TabsProps<TValue>) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.value === value),
  );

  const select = (index: number) => {
    tabRefs.current[index]?.focus();
    onValueChange(tabs[index].value);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
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
    <div aria-label={ariaLabel} className="m-tabs" role="tablist">
      {tabs.map((tab, index) => (
        <button
          aria-selected={tab.value === value}
          className={cx(
            "m-tabs__tab",
            tab.value === value && "m-tabs__tab--active",
          )}
          key={tab.value}
          onClick={() => onValueChange(tab.value)}
          onKeyDown={handleKeyDown}
          ref={(element) => {
            tabRefs.current[index] = element;
          }}
          role="tab"
          tabIndex={index === activeIndex ? 0 : -1}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export interface ProgressStepsProps {
  current: number;
  steps: string[];
}

export function ProgressSteps({ current, steps }: ProgressStepsProps) {
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

export function Modal({ actions, children, onClose, open, title }: ModalProps) {
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
        aria-modal="true"
        className="m-modal__panel"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="m-modal__header">
          <h2>{title}</h2>
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
