import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Login | East Coast Wellness",
  description: "Sign in to view East Coast Wellness orders.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f2ea] px-6 py-14 text-[#171411]">
      <div className="mx-auto max-w-3xl text-center">
        <Link href="/" className="text-sm font-bold text-[#a24b00]">
          East Coast Wellness
        </Link>
        <h1 className="mt-5 text-5xl font-semibold tracking-tighter">
          Account login.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#62564c]">
          Sign in to view previous orders. Guest checkout remains available
          without an account.
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
