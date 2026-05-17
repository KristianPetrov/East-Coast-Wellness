"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-[#171411] transition hover:bg-[#fff8ef]"
    >
      Sign Out
    </button>
  );
}
