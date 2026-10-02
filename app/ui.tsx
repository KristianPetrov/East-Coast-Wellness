import type { ReactNode } from "react";

/*
 * Shared storefront primitives. Class strings live here so every page uses
 * the same buttons, fields, and labels instead of re-declaring them inline.
 */

export const btnPrimary =
  "btn-sheen inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium tracking-wide text-bone shadow-[0_10px_30px_-12px_rgba(22,19,15,0.55)] transition duration-300 hover:-translate-y-0.5 hover:bg-ink-soft disabled:pointer-events-none disabled:bg-faint disabled:shadow-none";

export const btnCopper =
  "btn-sheen inline-flex items-center justify-center gap-2 rounded-full bg-copper px-6 py-3.5 text-sm font-medium tracking-wide text-white shadow-[0_10px_30px_-12px_rgba(127,66,19,0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-copper-deep disabled:pointer-events-none disabled:bg-faint disabled:shadow-none";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-bone/60 px-6 py-3.5 text-sm font-medium tracking-wide text-ink transition duration-300 hover:-translate-y-0.5 hover:border-ink/30 hover:bg-bone disabled:pointer-events-none disabled:opacity-50";

export const fieldLabel = "grid gap-2 text-[13px] font-medium text-ink-soft";

export const fieldInput =
  "w-full rounded-xl border border-ink/12 bg-bone px-4 py-3 text-base font-normal text-ink outline-none transition placeholder:text-faint hover:border-ink/25 focus:border-copper focus:bg-white focus:ring-4 focus:ring-copper/12";

export const card =
  "rounded-2xl border border-ink/10 bg-white/80 shadow-[0_1px_0_rgba(22,19,15,0.04),0_24px_48px_-32px_rgba(60,35,10,0.35)]";

export function Eyebrow({
  children,
  className = "text-copper",
  center = false,
}: {
  children: ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] ${
        center ? "justify-center" : ""
      } ${className}`}
    >
      <span className="h-px w-8 bg-current opacity-60" aria-hidden="true" />
      {children}
    </p>
  );
}

export function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`${className} transition-transform duration-300 group-hover:translate-x-1`}
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Notice({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const tones = {
    error: "border-rust/20 bg-rust-wash text-rust",
    success: "border-sage/20 bg-sage-wash text-sage",
    info: "border-copper/20 bg-copper-wash text-copper-deep",
  } as const;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${tones[tone]}`}
    >
      {children}
    </p>
  );
}

/** Small uppercase status chip for order/payment/shipping states. */
export function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "neutral" | "accent";
  children: ReactNode;
}) {
  const tones = {
    success: "bg-sage-wash text-sage",
    warning: "bg-amber-wash text-amber-ink",
    danger: "bg-rust-wash text-rust",
    neutral: "bg-sand text-muted",
    accent: "bg-copper-wash text-copper-deep",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

/** Compact centered page intro used by account, lookup, and auth pages. */
export function PageIntro({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <div className="animate-rise mx-auto max-w-2xl text-center">
      <Eyebrow center>{eyebrow}</Eyebrow>
      <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight text-ink sm:text-6xl">
        {title}
        {accent ? (
          <>
            {" "}
            <span className="text-gradient-copper italic">{accent}</span>
          </>
        ) : null}
      </h1>
      {children ? (
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
          {children}
        </p>
      ) : null}
    </div>
  );
}
