import type { orderItems, orders } from "@/db/schema";
import { formatCents } from "@/lib/money";
import { StatusPill } from "@/app/ui";
import { cancelOrder, deleteOrder, updateOrderStatus } from "../actions";
import { SubmitButton } from "../FormButtons";
import {
  adminInput,
  adminLabel,
  EmptyState,
  FilterTabs,
  PanelHeader,
  SearchBox,
  StatCard,
} from "../ui";

type Order = typeof orders.$inferSelect;
type OrderItem = typeof orderItems.$inferSelect;

export type OrderFilter = "all" | "payment" | "ship" | "shipped" | "cancelled";

const orderCreatedAtFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Los_Angeles",
  timeZoneName: "short",
});

function matchesFilter(order: Order, filter: OrderFilter) {
  const active = order.orderStatus !== "cancelled";

  switch (filter) {
    case "payment":
      return active && order.paymentStatus === "pending";
    case "ship":
      return active && order.paymentStatus === "paid" && order.shippingStatus === "pending";
    case "shipped":
      return active && order.shippingStatus === "shipped";
    case "cancelled":
      return !active;
    default:
      return true;
  }
}

function isAdjustment(item: OrderItem) {
  return item.productId.startsWith("shipping:") || item.productId.startsWith("discount:");
}

export function OrdersPanel({
  orderRows,
  itemRows,
  filter,
  query,
  shipStationEnabled,
  lowStockCount,
  outOfStockCount,
}: {
  orderRows: Order[];
  itemRows: OrderItem[];
  filter: OrderFilter;
  query?: string;
  shipStationEnabled: boolean;
  lowStockCount: number;
  outOfStockCount: number;
}) {
  const activeOrders = orderRows.filter((order) => order.orderStatus !== "cancelled");
  const paidRevenue = activeOrders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((total, order) => total + order.totalCents, 0);
  const awaitingPayment = activeOrders.filter((order) => matchesFilter(order, "payment"));
  const readyToShip = activeOrders.filter((order) => matchesFilter(order, "ship"));
  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const visibleOrders = orderRows.filter(
    (order) =>
      matchesFilter(order, filter) &&
      (!normalizedQuery ||
        [order.orderNumber, order.customerName, order.customerEmail, order.customerPhone]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)),
  );
  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const item of itemRows) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }
  const filterHref = (key: OrderFilter) => {
    const params = new URLSearchParams();
    if (key !== "all") params.set("status", key);
    if (query) params.set("q", query);
    const search = params.toString();
    return search ? `/admin?${search}` : "/admin";
  };

  return (
    <div className="grid gap-8">
      <PanelHeader
        title="Orders"
        description="Confirm payments, add tracking, and manage every order from one place."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Paid revenue"
          value={formatCents(paidRevenue)}
          hint={`${activeOrders.length} active ${activeOrders.length === 1 ? "order" : "orders"}`}
          tone="success"
        />
        <StatCard
          label="Awaiting payment"
          value={awaitingPayment.length}
          hint={formatCents(awaitingPayment.reduce((total, order) => total + order.totalCents, 0))}
          tone={awaitingPayment.length > 0 ? "warning" : "neutral"}
          href={filterHref("payment")}
        />
        <StatCard
          label="Ready to ship"
          value={readyToShip.length}
          hint="Paid, not yet shipped"
          tone={readyToShip.length > 0 ? "warning" : "neutral"}
          href={filterHref("ship")}
        />
        <StatCard
          label="Stock alerts"
          value={lowStockCount + outOfStockCount}
          hint={`${outOfStockCount} out · ${lowStockCount} low`}
          tone={outOfStockCount > 0 ? "danger" : lowStockCount > 0 ? "warning" : "neutral"}
          href="/admin?tab=inventory&stock=alerts"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          active={filter}
          options={[
            { key: "all", label: "All", count: orderRows.length, href: filterHref("all") },
            { key: "payment", label: "Awaiting payment", count: awaitingPayment.length, href: filterHref("payment") },
            { key: "ship", label: "Ready to ship", count: readyToShip.length, href: filterHref("ship") },
            {
              key: "shipped",
              label: "Shipped",
              count: orderRows.filter((order) => matchesFilter(order, "shipped")).length,
              href: filterHref("shipped"),
            },
            {
              key: "cancelled",
              label: "Cancelled",
              count: orderRows.length - activeOrders.length,
              href: filterHref("cancelled"),
            },
          ]}
        />
        <SearchBox
          tab="orders"
          query={query}
          placeholder="Search order, name, email"
          hidden={{ status: filter === "all" ? undefined : filter }}
        />
      </div>

      {visibleOrders.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
          <div className="hidden grid-cols-[1.3fr_1.4fr_1.2fr_0.7fr_1.5rem] gap-4 border-b border-ink/10 bg-bone px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint lg:grid">
            <span>Order</span>
            <span>Customer</span>
            <span>Status</span>
            <span className="text-right">Total</span>
            <span />
          </div>
          {visibleOrders.map((order, index) => (
            <OrderRow
              key={order.id}
              order={order}
              items={itemsByOrder.get(order.id) ?? []}
              shipStationEnabled={shipStationEnabled}
              bordered={index > 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState title={orderRows.length === 0 ? "No orders yet" : "No matching orders"}>
          {orderRows.length === 0
            ? "Orders will appear here after checkout."
            : "Try another filter or search term."}
        </EmptyState>
      )}
    </div>
  );
}

function OrderRow({
  order,
  items,
  shipStationEnabled,
  bordered,
}: {
  order: Order;
  items: OrderItem[];
  shipStationEnabled: boolean;
  bordered: boolean;
}) {
  const isCancelled = order.orderStatus === "cancelled";
  const products = items.filter((item) => !isAdjustment(item));
  const adjustments = items.filter(isAdjustment);

  return (
    <details className={`group/order ${bordered ? "border-t border-ink/10" : ""}`}>
      <summary className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-4 transition hover:bg-bone lg:grid-cols-[1.3fr_1.4fr_1.2fr_0.7fr_1.5rem]">
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{order.orderNumber}</p>
          <p className="mt-0.5 text-xs text-muted">
            <time dateTime={order.createdAt.toISOString()}>
              {orderCreatedAtFormatter.format(order.createdAt)}
            </time>
          </p>
        </div>
        <p className="text-right font-display text-xl tabular-nums lg:hidden">
          {formatCents(order.totalCents)}
        </p>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{order.customerName}</p>
          <p className="truncate text-xs text-muted">{order.customerEmail}</p>
        </div>
        <div className="col-span-2 flex flex-wrap gap-1.5 lg:col-span-1">
          {isCancelled ? (
            <StatusPill tone="danger">Cancelled</StatusPill>
          ) : (
            <>
              <StatusPill tone={order.paymentStatus === "paid" ? "success" : "warning"}>
                {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
              </StatusPill>
              <StatusPill tone={order.shippingStatus === "shipped" ? "success" : "neutral"}>
                {order.shippingStatus === "shipped" ? "Shipped" : "Unshipped"}
              </StatusPill>
            </>
          )}
          {order.referralCode ? <StatusPill tone="accent">{order.referralCode}</StatusPill> : null}
        </div>
        <p className="hidden text-right font-display text-xl tabular-nums lg:block">
          {formatCents(order.totalCents)}
        </p>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="details-chevron hidden h-4 w-4 text-faint lg:block"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="grid gap-6 border-t border-ink/8 bg-paper/60 px-5 py-6 lg:grid-cols-[1.1fr_0.9fr_1.2fr]">
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">Items</h3>
          <ul className="mt-3 divide-y divide-ink/8 rounded-lg border border-ink/10 bg-white px-4">
            {products.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="font-medium">{item.name}</span>
                  <span className="block text-xs text-muted">
                    {item.amount} · Qty {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatCents(item.priceCents * item.quantity)}
                </span>
              </li>
            ))}
            {adjustments.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3 text-sm text-muted">
                <span>{item.name}</span>
                <span className="shrink-0 tabular-nums">
                  {formatCents(item.priceCents * item.quantity)}
                </span>
              </li>
            ))}
            <li className="flex justify-between gap-4 py-3 text-sm font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatCents(order.totalCents)}</span>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">Customer</h3>
          <div className="mt-3 rounded-lg border border-ink/10 bg-white p-4 text-sm leading-6">
            <p className="font-medium">{order.customerName}</p>
            <p className="text-muted">
              <a href={`mailto:${order.customerEmail}`} className="hover:text-copper hover:underline">
                {order.customerEmail}
              </a>
            </p>
            <p className="text-muted">
              <a href={`tel:${order.customerPhone}`} className="hover:text-copper hover:underline">
                {order.customerPhone}
              </a>
            </p>
            <p className="mt-3 text-muted">
              {order.addressLine1}
              {order.addressLine2 ? `, ${order.addressLine2}` : ""}
              <br />
              {order.city}, {order.state} {order.postalCode}
            </p>
            {order.referralCode ? (
              <p className="mt-3 text-copper-deep">
                Referral {order.referralCode} · {formatCents(order.referralDiscountCents)} off
              </p>
            ) : null}
          </div>

          {shipStationEnabled ? (
            <div className="mt-3 rounded-lg border border-ink/10 bg-white p-4 text-xs leading-5 text-muted">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink">ShipStation</span>
                <StatusPill
                  tone={
                    order.shipStationSyncStatus === "synced"
                      ? "success"
                      : order.shipStationSyncStatus === "failed"
                        ? "danger"
                        : "accent"
                  }
                >
                  {order.shipStationSyncStatus}
                </StatusPill>
              </div>
              <p className="mt-2">
                External shipment: {order.shipStationExternalShipmentId ?? order.orderNumber}
              </p>
              {order.shipStationShipmentId ? <p>Shipment ID: {order.shipStationShipmentId}</p> : null}
              {order.shipStationAddressValidationStatus ? (
                <p>Address validation: {order.shipStationAddressValidationStatus}</p>
              ) : null}
              {order.shipStationAddressValidationMessage ? (
                <p>{order.shipStationAddressValidationMessage}</p>
              ) : null}
              {order.shipStationMatchedAddress ? (
                <p className="whitespace-pre-line">Matched address: {order.shipStationMatchedAddress}</p>
              ) : null}
              {order.shipStationSyncError ? (
                <p className="mt-2 font-medium text-rust">{order.shipStationSyncError}</p>
              ) : null}
            </div>
          ) : null}
        </section>

        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">Fulfillment</h3>
          <form
            action={updateOrderStatus}
            className="mt-3 grid gap-3 rounded-lg border border-ink/10 bg-white p-4 sm:grid-cols-2"
          >
            <input type="hidden" name="orderId" value={order.id} />
            <label className={adminLabel}>
              Payment
              <select name="paymentStatus" defaultValue={order.paymentStatus} className={adminInput}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </label>
            <label className={adminLabel}>
              Shipping
              <select name="shippingStatus" defaultValue={order.shippingStatus} className={adminInput}>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
              </select>
            </label>
            <label className={adminLabel}>
              Carrier
              <select name="carrier" defaultValue={order.carrier ?? ""} className={adminInput}>
                <option value="">Not selected</option>
                <option value="USPS">USPS</option>
                <option value="UPS">UPS</option>
              </select>
            </label>
            <label className={adminLabel}>
              Tracking number
              <input
                name="trackingNumber"
                defaultValue={order.trackingNumber ?? ""}
                className={adminInput}
              />
            </label>
            <SubmitButton className="sm:col-span-2" pendingLabel="Updating…" savedLabel="Order updated">
              Update order
            </SubmitButton>
          </form>

          <div className="mt-3 rounded-lg border border-rust/15 bg-white p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <form action={cancelOrder}>
                <input type="hidden" name="orderId" value={order.id} />
                <SubmitButton
                  variant="danger-ghost"
                  className="w-full"
                  disabled={isCancelled}
                  pendingLabel="Cancelling…"
                  savedLabel="Cancelled"
                  confirmMessage={`Cancel ${order.orderNumber} and return its inventory?`}
                >
                  {isCancelled ? "Order cancelled" : "Cancel and restock"}
                </SubmitButton>
              </form>
              <form action={deleteOrder}>
                <input type="hidden" name="orderId" value={order.id} />
                <SubmitButton
                  variant="danger"
                  className="w-full"
                  pendingLabel="Deleting…"
                  savedLabel="Deleted"
                  confirmMessage={`Permanently delete ${order.orderNumber}? This cannot be undone.`}
                >
                  Delete order
                </SubmitButton>
              </form>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">
              Cancel keeps the order record and returns inventory once. Delete
              removes the order and returns inventory first only if it has not
              already been returned.
            </p>
          </div>
        </section>
      </div>
    </details>
  );
}
