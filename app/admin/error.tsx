"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-14 text-ink">
      <section className="max-w-md rounded-2xl border border-ink/10 bg-white p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rust">
          Something went wrong
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight">The dashboard hit a snag.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {process.env.NODE_ENV === "development" && error.message
            ? error.message
            : "Check the values you entered and try again. If it keeps happening, reload the dashboard."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bone transition hover:bg-ink-soft"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium transition hover:bg-sand"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
