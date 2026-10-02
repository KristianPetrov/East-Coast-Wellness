import type { Metadata } from "next";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import { getOrderByNumberForEmail } from "@/lib/orders";
import { SiteFooter } from "@/app/SiteFooter";
import { SiteHeader } from "@/app/SiteHeader";
import { btnPrimary, Eyebrow, PageIntro } from "@/app/ui";
import { OrderDetails, OrderStatePills } from "../OrderDetails";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ email?: string }>;
};

export const metadata: Metadata = {
  title: "Order Status",
  description: "View East Coast Wellness order status.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({ params, searchParams }: PageProps) {
  const { orderNumber } = await params;
  const { email } = await searchParams;
  const result = email
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
                <div className="min-w-0">
                  <Eyebrow>Order status</Eyebrow>
                  <h1 className="mt-4 break-all font-display text-4xl tracking-tight sm:text-5xl">
                    {result.order.orderNumber}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <OrderStatePills order={result.order} />
                    <span className="text-sm text-muted">{result.order.customerEmail}</span>
                  </div>
                </div>
                <p className="font-display text-5xl tabular-nums">
                  {formatCents(result.order.totalCents)}
                </p>
              </div>
            }
          />
        ) : (
          <>
            <PageIntro eyebrow="Order status" title="Order not" accent="found.">
              Check the order number and email address used at checkout.
            </PageIntro>
            <div className="mt-10 text-center">
              <Link href="/orders/lookup" className={btnPrimary}>
                Try again
              </Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
