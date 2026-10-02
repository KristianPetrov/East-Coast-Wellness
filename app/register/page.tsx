import type { Metadata } from "next";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "../SiteHeader";
import { PageIntro } from "../ui";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register",
  description: "Create an East Coast Wellness account.",
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
        <PageIntro eyebrow="Account" title="Create an" accent="account.">
          Accounts make it easier to view orders, but checkout also supports guests.
        </PageIntro>
        <RegisterForm />
      </main>
      <SiteFooter />
    </>
  );
}
