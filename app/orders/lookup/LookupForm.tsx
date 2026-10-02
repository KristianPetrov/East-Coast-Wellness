"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { btnPrimary, card, fieldInput, fieldLabel } from "../../ui";

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
      className={`animate-rise mx-auto mt-12 grid max-w-md gap-5 p-6 sm:p-8 ${card}`}
      style={{ "--delay": "150ms" } as React.CSSProperties}
    >
      <label className={fieldLabel}>
        Order Number
        <input
          name="orderNumber"
          required
          placeholder="ECW-..."
          className={`${fieldInput} uppercase placeholder:normal-case`}
        />
      </label>
      <label className={fieldLabel}>
        Email Address
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldInput}
        />
      </label>
      <button
        type="submit"
        className={`${btnPrimary} mt-1 w-full py-4!`}
      >
        Look Up Order
      </button>
    </form>
  );
}
