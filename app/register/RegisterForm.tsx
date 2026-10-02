"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";
import { btnPrimary, card, fieldInput, fieldLabel, Notice } from "../ui";

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      setMessage("");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setMessage(data.message ?? "Could not create account.");
        return;
      }

      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/account/orders");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`animate-rise mx-auto mt-12 grid max-w-md gap-5 p-6 sm:p-8 ${card}`}
      style={{ "--delay": "150ms" } as React.CSSProperties}
    >
      <label className={fieldLabel}>
        Full Name
        <input
          name="name"
          required
          autoComplete="name"
          className={fieldInput}
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
      <label className={fieldLabel}>
        Password
        <input
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className={fieldInput}
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className={`${btnPrimary} mt-1 w-full py-4!`}
      >
        {isPending ? "Creating Account..." : "Create Account"}
      </button>
      {message ? <Notice>{message}</Notice> : null}
      <p className="border-t border-ink/8 pt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-copper underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
