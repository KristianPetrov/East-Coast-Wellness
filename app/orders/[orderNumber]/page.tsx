import type { Metadata } from "next";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import {
  getOrderByNumberForEmail,
  paymentInstructions,
  paymentMethodLabels,
} from "@/lib/orders";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ email?: string }>;
};

export const metadata: Metadata = {
  title: "Order Status | East Coast Wellness",
  description: "View East Coast Wellness order status.",
};

export default async function Page({ params, searchParams }: PageProps) {
  const { orderNumber } = await params;
  const { email } = await searchParams;
  const result = email
    ? await getOrderByNumberForEmail(orderNumber, email)
    : null;

  if (!result) {
    return (
      <main className="min-h-screen bg-[#f7f2ea] px-6 py-14 text-[#171411]">
        <section className="mx-auto max-w-3xl rounded-4xl border border-black/10 bg-white p-8 text-center shadow-xl shadow-orange-950/10">
          <h1 className="text-4xl font-semibold tracking-tighter">
            Order not found.
          </h1>
          <p className="mt-4 text-[#62564c]">
            Check the order number and email address used at checkout.
          </p>
          <Link
            href="/orders/lookup"
            className="mt-6 inline-block rounded-full bg-[#171411] px-6 py-3 text-sm font-bold text-white"
          >
            Try Again
          </Link>
        </section>
      </main>
    );
  }

  const { order, items } = result;

  return (
    <main className="min-h-screen bg-[#f7f2ea] px-6 py-14 text-[#171411]">
      <section className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-bold text-[#a24b00]">
          East Coast Wellness
        </Link>
        <div className="mt-5 rounded-4xl border border-black/10 bg-white p-8 shadow-xl shadow-orange-950/10">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#c95f00]">
            Order Status
          </p>
          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-5xl font-semibold tracking-tighter">
                {order.orderNumber}
              </h1>
              <p className="mt-3 text-[#62564c]">{order.customerEmail}</p>
            </div>
            <p className="text-4xl font-semibold">
              {formatCents(order.totalCents)}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-[#fff8ef] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a24b00]">
                Payment
              </p>
              <p className="mt-2 text-xl font-semibold">
                {order.paymentStatus}
              </p>
              <p className="mt-2 text-sm text-[#62564c]">
                {paymentMethodLabels[order.paymentMethod]}
              </p>
            </div>
            <div className="rounded-3xl bg-[#fff8ef] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a24b00]">
                Shipping
              </p>
              <p className="mt-2 text-xl font-semibold">
                {order.shippingStatus}
              </p>
              <p className="mt-2 text-sm text-[#62564c]">
                {order.carrier && order.trackingNumber
                  ? `${order.carrier} ${order.trackingNumber}`
                  : "Tracking will appear here when shipped."}
              </p>
            </div>
            <div className="rounded-3xl bg-[#fff8ef] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a24b00]">
                Manual Payment
              </p>
              <p className="mt-2 text-sm leading-6 text-[#62564c]">
                {paymentInstructions[order.paymentMethod]}
              </p>
            </div>
          </div>

          <div className="mt-8 divide-y divide-black/10">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-[#62564c]">
                    {item.amount} · Qty {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCents(item.priceCents * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
