"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({
  className = "inline-flex items-center justify-center rounded-full border border-ink/15 bg-bone/60 px-6 py-3.5 text-sm font-medium tracking-wide text-ink transition hover:border-ink/30 hover:bg-bone",
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className}
    >
      Sign out
    </button>
  );
}
