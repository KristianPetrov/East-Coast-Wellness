import Link from "next/link";
import type { ReactNode } from "react";

export const adminInput =
  "w-full rounded-lg border border-ink/12 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-ink outline-none transition placeholder:text-faint hover:border-ink/25 focus:border-copper focus:ring-4 focus:ring-copper/12";

export const adminLabel =
  "grid gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted";

export const adminCheckbox =
  "flex cursor-pointer items-center gap-2.5 rounded-lg border border-ink/12 bg-white px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:border-ink/25 has-[:checked]:border-copper/40 has-[:checked]:bg-copper-wash/60";

export function PanelHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "neutral" | "warning" | "danger" | "success";
  href?: string;
}) {
  const dot = {
    neutral: "bg-faint",
    warning: "bg-amber-ink",
    danger: "bg-rust",
    success: "bg-sage",
  }[tone];
  const content = (
    <>
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
        {label}
      </p>
      <p className="mt-3 font-display text-4xl tabular-nums tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-faint">{hint}</p> : null}
    </>
  );
  const className =
    "block rounded-xl border border-ink/10 bg-white p-5 transition";

  return href ? (
    <Link href={href} className={`${className} hover:border-ink/25 hover:shadow-[0_20px_40px_-30px_rgba(60,35,10,0.5)]`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export function FilterTabs({
  options,
  active,
}: {
  options: { key: string; label: string; count?: number; href: string }[];
  active: string;
}) {
  return (
    <nav
      aria-label="Filter"
      className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((option) => {
        const isActive = option.key === active;

        return (
          <Link
            key={option.key}
            href={option.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-ink text-bone"
                : "text-muted hover:bg-white hover:text-ink"
            }`}
          >
            {option.label}
            {option.count !== undefined ? (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${
                  isActive ? "bg-white/15 text-bone" : "bg-sand text-muted"
                }`}
              >
                {option.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** GET search form that keeps the current tab and filters. */
export function SearchBox({
  tab,
  query,
  placeholder,
  hidden = {},
}: {
  tab: string;
  query?: string;
  placeholder: string;
  hidden?: Record<string, string | undefined>;
}) {
  return (
    <form action="/admin" className="relative w-full sm:w-72" role="search">
      <input type="hidden" name="tab" value={tab} />
      {Object.entries(hidden).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
        aria-hidden
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4 4" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${adminInput} pl-9`}
      />
    </form>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink/15 bg-bone px-6 py-14 text-center">
      <p className="font-display text-2xl">{title}</p>
      {children ? <p className="mt-2 text-sm text-muted">{children}</p> : null}
    </div>
  );
}

/** Same as adminInput, but uppercases what is typed (referral codes). */
export const adminCodeInput = adminInput.replace("normal-case", "uppercase");
