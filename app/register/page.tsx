import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register | East Coast Wellness",
  description: "Create an East Coast Wellness account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f2ea] px-6 py-14 text-[#171411]">
      <div className="mx-auto max-w-3xl text-center">
        <Link href="/" className="text-sm font-bold text-[#a24b00]">
          East Coast Wellness
        </Link>
        <h1 className="mt-5 text-5xl font-semibold tracking-tighter">
          Create an account.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#62564c]">
          Accounts make it easier to view orders, but checkout also supports
          guests.
        </p>
      </div>
      <RegisterForm />
    </main>
  );
}
