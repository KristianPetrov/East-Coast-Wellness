"use client";

import Link from "next/link";
import { useState } from "react";

type ManualPaymentActionsProps = {
  venmoUrl: string;
  zelleCopyText: string;
};

export function ManualPaymentActions({
  venmoUrl,
  zelleCopyText,
}: ManualPaymentActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyZelleDetails() {
    await navigator.clipboard.writeText(zelleCopyText);
    setCopied(true);
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Link
        href={venmoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-sheen rounded-full bg-ink px-6 py-3.5 text-center text-sm font-medium tracking-wide text-bone transition hover:-translate-y-0.5 hover:bg-ink-soft"
      >
        Pay with Venmo
      </Link>
      <button
        type="button"
        onClick={copyZelleDetails}
        className={`rounded-full border px-6 py-3.5 text-sm font-medium tracking-wide transition hover:-translate-y-0.5 ${
          copied
            ? "border-sage/30 bg-sage-wash text-sage"
            : "border-ink/15 bg-bone text-ink hover:border-ink/30"
        }`}
      >
        {copied ? "Zelle details copied ✓" : "Copy Zelle details"}
      </button>
    </div>
  );
}
