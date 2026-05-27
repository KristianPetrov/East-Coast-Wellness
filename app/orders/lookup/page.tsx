import type { Metadata } from "next";
import Link from "next/link";
import { LookupForm } from "./LookupForm";

export const metadata: Metadata = {
  title: "Order Lookup | East Coast Wellness",
  description: "Look up an East Coast Wellness order by order number and email.",
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
          Look up an order.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#62564c]">
          Enter the order number and email used at checkout to view payment,
          shipping, and tracking status.
        </p>
      </div>
      <LookupForm />
    </main>
  );
}
