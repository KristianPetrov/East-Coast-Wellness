"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Variant = "primary" | "secondary" | "danger" | "danger-ghost";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bone hover:bg-ink-soft",
  secondary: "border border-ink/15 bg-white text-ink hover:border-ink/30 hover:bg-bone",
  danger: "bg-rust text-white hover:bg-[#7d2222]",
  "danger-ghost": "border border-rust/25 bg-white text-rust hover:bg-rust-wash",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50";

function Spinner() {
  return (
    <span
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
}

/**
 * Submit button for admin server-action forms. Shows a spinner while the
 * action runs and a brief "Saved" confirmation once it finishes.
 */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  savedLabel = "Saved",
  variant = "primary",
  className = "",
  formAction,
  formNoValidate,
  disabled,
  confirmMessage,
}: {
  children: ReactNode;
  pendingLabel?: string;
  savedLabel?: string;
  variant?: Variant;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  formNoValidate?: boolean;
  disabled?: boolean;
  confirmMessage?: string;
}) {
  const status = useFormStatus();
  const isMine =
    status.pending && (formAction ? status.action === formAction : true);
  const wasPending = useRef(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isMine) {
      wasPending.current = true;
      return;
    }

    if (wasPending.current) {
      wasPending.current = false;
      setSaved(true);
      const timer = window.setTimeout(() => setSaved(false), 1800);
      return () => window.clearTimeout(timer);
    }
  }, [isMine]);

  return (
    <button
      type="submit"
      formAction={formAction}
      formNoValidate={formNoValidate}
      disabled={disabled || status.pending}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={`${base} ${
        saved && !isMine ? "bg-sage text-white hover:bg-sage" : variants[variant]
      } ${className}`}
    >
      {isMine ? (
        <>
          <Spinner />
          {pendingLabel}
        </>
      ) : saved ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="draw-check h-3.5 w-3.5" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {savedLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
