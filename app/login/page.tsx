import type { Metadata } from "next";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "../SiteHeader";
import { PageIntro } from "../ui";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to view East Coast Wellness orders.",
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
        <PageIntro eyebrow="Account" title="Welcome" accent="back.">
          Sign in to view previous orders. Guest checkout remains available without an account.
        </PageIntro>
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
