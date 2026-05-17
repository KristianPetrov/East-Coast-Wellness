"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export function LookupForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const orderNumber = String(formData.get("orderNumber") ?? "")
      .trim()
      .toUpperCase();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    if (orderNumber && email) {
      router.push(`/orders/${orderNumber}?email=${encodeURIComponent(email)}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 grid max-w-xl gap-5 rounded-4xl border border-black/10 bg-white p-6 shadow-xl shadow-orange-950/10"
    >
      <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
        Order Number
        <input
          name="orderNumber"
          required
          placeholder="ECW-..."
          className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal uppercase outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
        Email Address
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-[#171411] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#302821]"
      >
        Look Up Order
      </button>
    </form>
  );
}
