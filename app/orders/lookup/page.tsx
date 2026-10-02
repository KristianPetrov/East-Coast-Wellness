import type { Metadata } from "next";
import { SiteFooter } from "@/app/SiteFooter";
import { SiteHeader } from "@/app/SiteHeader";
import { PageIntro } from "@/app/ui";
import { LookupForm } from "./LookupForm";

export const metadata: Metadata = {
  title: "Order Lookup",
  description: "Look up an East Coast Wellness order by order number and email.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-paper px-5 pb-24 pt-14 text-ink sm:px-6 sm:pt-20">
        <PageIntro eyebrow="Track an order" title="Look up" accent="an order.">
          Enter the order number and email used at checkout to view payment,
          shipping, and tracking status.
        </PageIntro>
        <LookupForm />
      </main>
      <SiteFooter />
    </>
  );
}
