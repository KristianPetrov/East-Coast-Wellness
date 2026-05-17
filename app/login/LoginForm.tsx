"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";

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
      className="mx-auto mt-10 grid max-w-xl gap-5 rounded-4xl border border-black/10 bg-white p-6 shadow-xl shadow-orange-950/10"
    >
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
      <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-[#171411] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#302821] disabled:cursor-not-allowed disabled:bg-[#8b8178]"
      >
        {isPending ? "Signing In..." : "Sign In"}
      </button>
      {message ? (
        <p className="rounded-2xl bg-[#fff1f1] p-4 text-sm font-semibold text-[#8a1f1f]">
          {message}
        </p>
      ) : null}
      <p className="text-center text-sm text-[#62564c]">
        Need an account?{" "}
        <Link href="/register" className="font-semibold text-[#a24b00]">
          Create one
        </Link>
      </p>
    </form>
  );
}
