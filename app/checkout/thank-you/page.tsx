import type { Metadata } from "next";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import { getOrderByNumberForEmail } from "@/lib/orders";
import { OrderDetails } from "@/app/orders/OrderDetails";
import { SiteFooter } from "@/app/SiteFooter";
import { SiteHeader } from "@/app/SiteHeader";
import { ArrowIcon, btnGhost, btnPrimary, Eyebrow, PageIntro } from "@/app/ui";

type PageProps = {
  searchParams: Promise<{ orderNumber?: string; email?: string }>;
};

export const metadata: Metadata = {
  title: "Thank You",
  description: "East Coast Wellness order confirmation and payment details.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({ searchParams }: PageProps) {
  const { orderNumber, email } = await searchParams;
  const result =
    orderNumber && email
      ? await getOrderByNumberForEmail(orderNumber, email)
      : null;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-paper px-5 pb-24 pt-12 text-ink sm:px-6 sm:pt-16">
        {result ? (
          <OrderDetails
            order={result.order}
            items={result.items}
            header={
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage text-white" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="draw-check h-5 w-5">
                      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div className="mt-6">
                    <Eyebrow>Thank you</Eyebrow>
                  </div>
                  <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
                    Your order was <span className="italic text-copper">received.</span>
                  </h1>
                  <p className="mt-4 max-w-xl leading-7 text-muted">
                    Order <span className="font-medium text-ink">{result.order.orderNumber}</span>{" "}
                    is pending payment. A confirmation email has been sent to{" "}
                    {result.order.customerEmail}.
                  </p>
                </div>
                <p className="font-display text-5xl tabular-nums">
                  {formatCents(result.order.totalCents)}
                </p>
              </div>
            }
            footer={
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/orders/${result.order.orderNumber}?email=${encodeURIComponent(
                    result.order.customerEmail,
                  )}`}
                  className={`group ${btnPrimary}`}
                >
                  View order status
                  <ArrowIcon />
                </Link>
                <Link href="/store" className={btnGhost}>
                  Continue shopping
                </Link>
              </div>
            }
          />
        ) : (
          <>
            <PageIntro eyebrow="Thank you" title="We could not load" accent="that order.">
              Check the order number and email address used at checkout.
            </PageIntro>
            <div className="mt-10 text-center">
              <Link href="/orders/lookup" className={btnPrimary}>
                Look up order
              </Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
