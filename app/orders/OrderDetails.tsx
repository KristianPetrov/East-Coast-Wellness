import type { ReactNode } from "react";
import type { orderItems, orders } from "@/db/schema";
import { formatCents } from "@/lib/money";
import { isShipStationEnabled } from "@/lib/shipstation";
import { ManualPaymentActions } from "@/app/ManualPaymentActions";
import { buildVenmoPaymentUrl, zellePhone } from "@/lib/orders";
import { StatusPill } from "@/app/ui";

type Order = typeof orders.$inferSelect;
type OrderItem = typeof orderItems.$inferSelect;

const placedAtFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});

function isAdjustment(item: OrderItem) {
  return (
    item.productId.startsWith("shipping:") ||
    item.productId.startsWith("discount:")
  );
}

/**
 * Shared order body for the thank-you and order status pages: a progress
 * tracker, payment instructions while unpaid, and an itemized receipt.
 */
export function OrderDetails({
  order,
  items,
  header,
  footer,
}: {
  order: Order;
  items: OrderItem[];
  header: ReactNode;
  footer?: ReactNode;
}) {
  const isCancelled = order.orderStatus === "cancelled";
  const isPaid = order.paymentStatus === "paid";
  const isShipped = order.shippingStatus === "shipped";
  const products = items.filter((item) => !isAdjustment(item));
  const adjustments = items.filter(isAdjustment);
  const productSubtotal = products.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  );
  const venmoUrl = buildVenmoPaymentUrl(order);
  const zelleCopyText = `Send ${formatCents(
    order.totalCents,
  )} by Zelle to ${zellePhone}. Include ${order.orderNumber} in the memo.`;

  const steps = [
    { label: "Order placed", detail: placedAtFormatter.format(order.createdAt), done: true },
    { label: "Payment received", detail: isPaid ? "Confirmed" : "Awaiting payment", done: isPaid },
    {
      label: "Shipped",
      detail:
        isShipped && order.carrier && order.trackingNumber
          ? `${order.carrier} ${order.trackingNumber}`
          : isShipped
            ? "On its way"
            : "Tracking appears here",
      done: isShipped,
    },
  ];

  return (
    <div className="animate-rise mx-auto max-w-5xl">
      <div className="rounded-2xl border border-ink/10 bg-white/80 shadow-[0_40px_80px_-50px_rgba(60,35,10,0.45)]">
        <div className="border-b border-ink/10 p-6 sm:p-10">{header}</div>

        {isCancelled ? (
          <div className="border-b border-ink/10 bg-rust-wash/60 px-6 py-5 text-sm font-medium text-rust sm:px-10">
            This order has been cancelled.
          </div>
        ) : (
          <ol className="grid gap-px border-b border-ink/10 bg-ink/10 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.label} className="flex items-start gap-4 bg-bone px-6 py-6 sm:px-8">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm ${
                    step.done
                      ? "border-sage bg-sage text-white"
                      : "border-ink/15 text-faint"
                  }`}
                  aria-hidden
                >
                  {step.done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5">
                      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="min-w-0">
                  <p className={`font-medium ${step.done ? "text-ink" : "text-muted"}`}>
                    {step.label}
                    <span className="sr-only">{step.done ? " (complete)" : " (pending)"}</span>
                  </p>
                  <p className="mt-0.5 break-words text-sm text-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {!isCancelled && !isPaid ? (
          <div className="border-b border-ink/10 p-6 sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
              Complete payment
            </p>
            <p className="mt-3 max-w-2xl leading-7 text-muted">
              Venmo opens with the order total and {order.orderNumber} already
              added to the note. For Zelle, copy the details and include the
              order ID in the memo.
            </p>
            <ManualPaymentActions venmoUrl={venmoUrl} zelleCopyText={zelleCopyText} />
          </div>
        ) : null}

        {isShipStationEnabled() && order.shipStationAddressValidationStatus ? (
          <div className="border-b border-ink/10 p-6 sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
              Address check
            </p>
            <p className="mt-2 text-lg font-medium capitalize">
              {order.shipStationAddressValidationStatus}
            </p>
            {order.shipStationAddressValidationMessage ? (
              <p className="mt-2 text-sm leading-6 text-muted">
                {order.shipStationAddressValidationMessage}
              </p>
            ) : null}
            {order.shipStationMatchedAddress ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">
                {order.shipStationMatchedAddress}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
              Items
            </p>
            <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {products.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {item.amount} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium tabular-nums">
                    {formatCents(item.priceCents * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
              Summary
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-muted">
                <dt>Products</dt>
                <dd className="tabular-nums">{formatCents(productSubtotal)}</dd>
              </div>
              {adjustments.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-muted">
                  <dt>{item.name}</dt>
                  <dd className="shrink-0 tabular-nums">
                    {formatCents(item.priceCents * item.quantity)}
                  </dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 border-t border-ink/10 pt-4">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="font-display text-3xl tabular-nums text-ink">
                  {formatCents(order.totalCents)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        {footer ? <div className="border-t border-ink/10 p-6 sm:px-10">{footer}</div> : null}
      </div>
    </div>
  );
}

export function OrderStatePills({
  order,
}: {
  order: { orderStatus: string; paymentStatus: string; shippingStatus: string };
}) {
  if (order.orderStatus === "cancelled") {
    return <StatusPill tone="danger">Cancelled</StatusPill>;
  }

  return (
    <>
      <StatusPill tone={order.paymentStatus === "paid" ? "success" : "warning"}>
        {order.paymentStatus === "paid" ? "Paid" : "Awaiting payment"}
      </StatusPill>
      <StatusPill tone={order.shippingStatus === "shipped" ? "success" : "neutral"}>
        {order.shippingStatus === "shipped" ? "Shipped" : "Not shipped"}
      </StatusPill>
    </>
  );
}
