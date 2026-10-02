"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";
import { btnPrimary, card, fieldInput, fieldLabel, Notice } from "../ui";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account/orders";
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      setMessage("");
      const result = await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setMessage("Invalid email or password.");
        return;
      }

      router.push(result?.url ?? callbackUrl);
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
          required
          autoComplete="current-password"
          className={fieldInput}
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className={`${btnPrimary} mt-1 w-full py-4!`}
      >
        {isPending ? "Signing In..." : "Sign In"}
      </button>
      {message ? <Notice>{message}</Notice> : null}
      <p className="border-t border-ink/8 pt-5 text-center text-sm text-muted">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-copper underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
