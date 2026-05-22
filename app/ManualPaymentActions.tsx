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
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <Link
        href={venmoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-[#171411] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#302821]"
      >
        Pay with Venmo
      </Link>
      <button
        type="button"
        onClick={copyZelleDetails}
        className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-[#171411] transition hover:border-[#ea7500]/40 hover:bg-[#fff8ef]"
      >
        {copied ? "Zelle details copied" : "Copy Zelle details"}
      </button>
    </div>
  );
}
