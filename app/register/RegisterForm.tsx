"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";

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
      className="mx-auto mt-10 grid max-w-xl gap-5 rounded-4xl border border-black/10 bg-white p-6 shadow-xl shadow-orange-950/10"
    >
      <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
        Full Name
        <input
          name="name"
          required
          autoComplete="name"
          className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
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
      <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
        Password
        <input
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-[#171411] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#302821] disabled:cursor-not-allowed disabled:bg-[#8b8178]"
      >
        {isPending ? "Creating Account..." : "Create Account"}
      </button>
      {message ? (
        <p className="rounded-2xl bg-[#fff1f1] p-4 text-sm font-semibold text-[#8a1f1f]">
          {message}
        </p>
      ) : null}
      <p className="text-center text-sm text-[#62564c]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#a24b00]">
          Sign in
        </Link>
      </p>
    </form>
  );
}
