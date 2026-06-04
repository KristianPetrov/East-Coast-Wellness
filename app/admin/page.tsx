import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { getAuthSession } from "@/auth";
import { db } from "@/db";
import {
  orderItems,
  orders,
  productInventory,
  referralCodes,
  referralPartners,
  users,
} from "@/db/schema";
import { products } from "@/app/products";
import { formatCents } from "@/lib/money";
import {
  cancelOrder,
  createReferralCode,
  createReferralPartner,
  deleteOrder,
  pullInventoryFromShipStation,
  syncInventoryToShipStation,
  updateInventory,
  updateMemberPricing,
  updateOrderStatus,
  updateReferralCode,
} from "./actions";

export const metadata: Metadata = {
  title: "Admin Dashboard | East Coast Wellness",
  description: "Manage East Coast Wellness orders and inventory.",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const session = await getAuthSession();
  const { tab } = await searchParams;
  const activeTab =
    tab === "inventory" || tab === "accounts" || tab === "referrals"
      ? tab
      : "orders";

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    return (
      <main className="min-h-screen bg-[#f7f2ea] px-6 py-14 text-[#171411]">
        <section className="mx-auto max-w-3xl rounded-4xl border border-black/10 bg-white p-8 text-center shadow-xl shadow-orange-950/10">
          <h1 className="text-4xl font-semibold tracking-tighter">
            Admin access required.
          </h1>
          <p className="mt-4 text-[#62564c]">
            Sign in with the admin email configured in ADMIN_EMAIL.
          </p>
        </section>
      </main>
    );
  }

  const [
    inventoryRows,
    orderRows,
    itemRows,
    userRows,
    referralPartnerRows,
    referralCodeRows,
  ] = await Promise.all([
    db.select().from(productInventory),
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(orderItems),
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(referralPartners).orderBy(desc(referralPartners.createdAt)),
    db.select().from(referralCodes).orderBy(desc(referralCodes.createdAt)),
  ]);
  const inventoryByProduct = new Map(
    inventoryRows.map((row) => [row.productId, row.quantity]),
  );
  const inventorySyncByProduct = new Map(
    inventoryRows.map((row) => [row.productId, row]),
  );
  const shipStationInventoryLocationId =
    process.env.SHIP_STATION_INVENTORY_LOCATION_ID?.trim();
  const shipStationInventoryConfigured = Boolean(
    process.env.SHIP_STATION_API_KEY?.trim() &&
      shipStationInventoryLocationId &&
      shipStationInventoryLocationId.toLowerCase() !== "null" &&
      shipStationInventoryLocationId.toLowerCase() !== "undefined",
  );
  const referralCodesByPartner = new Map(
    referralPartnerRows.map((partner) => [
      partner.id,
      referralCodeRows.filter((code) => code.partnerId === partner.id),
    ]),
  );
  const activeReferralOrders = orderRows.filter(
    (order) => order.orderStatus !== "cancelled" && order.referralPartnerId,
  );
  const referralTotalsByPartner = new Map(
    referralPartnerRows.map((partner) => {
      const partnerOrders = activeReferralOrders.filter(
        (order) => order.referralPartnerId === partner.id,
      );

      return [
        partner.id,
        {
          orders: partnerOrders.length,
          salesCents: partnerOrders.reduce(
            (total, order) => total + order.totalCents,
            0,
          ),
          discountCents: partnerOrders.reduce(
            (total, order) => total + order.referralDiscountCents,
            0,
          ),
        },
      ];
    }),
  );
  const referralTotalsByCode = new Map(
    referralCodeRows.map((code) => {
      const codeOrders = activeReferralOrders.filter(
        (order) => order.referralCodeId === code.id,
      );

      return [
        code.id,
        {
          orders: codeOrders.length,
          salesCents: codeOrders.reduce(
            (total, order) => total + order.totalCents,
            0,
          ),
          discountCents: codeOrders.reduce(
            (total, order) => total + order.referralDiscountCents,
            0,
          ),
        },
      ];
    }),
  );

  return (
    <main className="min-h-screen bg-[#f7f2ea] px-6 py-14 text-[#171411]">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#c95f00]">
              Admin
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tighter">
              Dashboard.
            </h1>
          </div>
          <Link
            href="/store"
            className="rounded-full bg-[#ea7500] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c95f00]"
          >
            Storefront
          </Link>
        </div>

        <div className="mt-10 rounded-full border border-black/10 bg-white p-2 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-4">
            <Link
              href="/admin"
              className={
                activeTab === "orders"
                  ? "rounded-full bg-[#171411] px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-black/10"
                  : "rounded-full px-5 py-3 text-center text-sm font-bold text-[#62564c] transition hover:bg-[#fff2e4] hover:text-[#171411]"
              }
            >
              Orders
            </Link>
            <Link
              href="/admin?tab=inventory"
              className={
                activeTab === "inventory"
                  ? "rounded-full bg-[#171411] px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-black/10"
                  : "rounded-full px-5 py-3 text-center text-sm font-bold text-[#62564c] transition hover:bg-[#fff2e4] hover:text-[#171411]"
              }
            >
              Inventory
            </Link>
            <Link
              href="/admin?tab=accounts"
              className={
                activeTab === "accounts"
                  ? "rounded-full bg-[#171411] px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-black/10"
                  : "rounded-full px-5 py-3 text-center text-sm font-bold text-[#62564c] transition hover:bg-[#fff2e4] hover:text-[#171411]"
              }
            >
              Accounts
            </Link>
            <Link
              href="/admin?tab=referrals"
              className={
                activeTab === "referrals"
                  ? "rounded-full bg-[#171411] px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-black/10"
                  : "rounded-full px-5 py-3 text-center text-sm font-bold text-[#62564c] transition hover:bg-[#fff2e4] hover:text-[#171411]"
              }
            >
              Referrals
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {activeTab === "orders" ? (
          <section className="rounded-4xl border border-black/10 bg-white p-6 shadow-xl shadow-orange-950/10">
            <h2 className="text-3xl font-semibold tracking-tighter">Orders</h2>
            <div className="mt-6 grid gap-5">
              {orderRows.length > 0 ? (
                orderRows.map((order) => {
                  const items = itemRows.filter(
                    (item) => item.orderId === order.id,
                  );

                  return (
                    <article
                      key={order.id}
                      className="rounded-3xl border border-black/10 bg-[#fffaf2] p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-[#a24b00]">
                              {order.orderNumber}
                            </p>
                            <span
                              className={
                                order.orderStatus === "cancelled"
                                  ? "rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-bold text-[#8a1f1f]"
                                  : "rounded-full bg-[#e8f5df] px-3 py-1 text-xs font-bold text-[#2f5f1e]"
                              }
                            >
                              {order.orderStatus}
                            </span>
                          </div>
                          <h3 className="mt-2 text-2xl font-semibold">
                            {order.customerName}
                          </h3>
                          <p className="mt-1 text-sm text-[#62564c]">
                            {order.customerEmail} · {order.customerPhone}
                          </p>
                          {order.referralCode ? (
                            <p className="mt-1 text-sm font-semibold text-[#a24b00]">
                              Referral {order.referralCode} ·{" "}
                              {formatCents(order.referralDiscountCents)} off
                            </p>
                          ) : null}
                        </div>
                        <p className="text-2xl font-semibold">
                          {formatCents(order.totalCents)}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-[#62564c]">
                        {order.addressLine1}
                        {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                        <br />
                        {order.city}, {order.state} {order.postalCode}
                      </div>

                      <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-[#62564c]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#171411]">
                            ShipStation
                          </span>
                          <span
                            className={
                              order.shipStationSyncStatus === "synced"
                                ? "rounded-full bg-[#e8f5df] px-3 py-1 text-xs font-bold text-[#2f5f1e]"
                                : order.shipStationSyncStatus === "failed"
                                  ? "rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-bold text-[#8a1f1f]"
                                  : "rounded-full bg-[#fff2e4] px-3 py-1 text-xs font-bold text-[#a24b00]"
                            }
                          >
                            {order.shipStationSyncStatus}
                          </span>
                        </div>
                        <p className="mt-2">
                          External shipment:{" "}
                          {order.shipStationExternalShipmentId ??
                            order.orderNumber}
                        </p>
                        {order.shipStationShipmentId ? (
                          <p>Shipment ID: {order.shipStationShipmentId}</p>
                        ) : null}
                        {order.shipStationAddressValidationStatus ? (
                          <p>
                            Address validation:{" "}
                            {order.shipStationAddressValidationStatus}
                          </p>
                        ) : null}
                        {order.shipStationAddressValidationMessage ? (
                          <p>{order.shipStationAddressValidationMessage}</p>
                        ) : null}
                        {order.shipStationMatchedAddress ? (
                          <p className="whitespace-pre-line">
                            Matched address:{" "}
                            {order.shipStationMatchedAddress}
                          </p>
                        ) : null}
                        {order.shipStationSyncError ? (
                          <p className="mt-2 font-semibold text-[#8a1f1f]">
                            {order.shipStationSyncError}
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-4 divide-y divide-black/10 rounded-2xl bg-white px-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between gap-4 py-3 text-sm"
                          >
                            <span>
                              {item.name} {item.amount} · Qty {item.quantity}
                            </span>
                            <span className="font-semibold">
                              {formatCents(item.priceCents * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <form
                        action={updateOrderStatus}
                        className="mt-4 grid gap-3 md:grid-cols-2"
                      >
                        <input type="hidden" name="orderId" value={order.id} />
                        <label className="grid gap-2 text-sm font-semibold">
                          Payment Status
                          <select
                            name="paymentStatus"
                            defaultValue={order.paymentStatus}
                            className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-normal outline-none focus:border-[#ea7500]"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-semibold">
                          Shipping Status
                          <select
                            name="shippingStatus"
                            defaultValue={order.shippingStatus}
                            className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-normal outline-none focus:border-[#ea7500]"
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-semibold">
                          Carrier
                          <select
                            name="carrier"
                            defaultValue={order.carrier ?? ""}
                            className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-normal outline-none focus:border-[#ea7500]"
                          >
                            <option value="">Not selected</option>
                            <option value="USPS">USPS</option>
                            <option value="UPS">UPS</option>
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-semibold">
                          Tracking Number
                          <input
                            name="trackingNumber"
                            defaultValue={order.trackingNumber ?? ""}
                            className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-normal outline-none focus:border-[#ea7500]"
                          />
                        </label>
                        <button
                          type="submit"
                          className="rounded-full bg-[#171411] px-5 py-3 text-sm font-bold text-white md:col-span-2"
                        >
                          Update Order
                        </button>
                      </form>

                      <div className="mt-4 grid gap-3 rounded-2xl border border-black/10 bg-white p-4 md:grid-cols-2">
                        <form action={cancelOrder}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button
                            type="submit"
                            disabled={order.orderStatus === "cancelled"}
                            className="w-full rounded-full bg-[#8a1f1f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#6f1717] disabled:cursor-not-allowed disabled:bg-[#c5b8af]"
                          >
                            {order.orderStatus === "cancelled"
                              ? "Order Cancelled"
                              : "Cancel and Return Inventory"}
                          </button>
                        </form>
                        <form action={deleteOrder}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button
                            type="submit"
                            className="w-full rounded-full border border-[#8a1f1f]/30 bg-white px-5 py-3 text-sm font-bold text-[#8a1f1f] transition hover:bg-[#fff1f1]"
                          >
                            Delete Order
                          </button>
                        </form>
                        <p className="text-xs leading-5 text-[#62564c] md:col-span-2">
                          Cancel keeps the order record and returns inventory
                          once. Delete removes the order and returns inventory
                          first only if it has not already been returned.
                        </p>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="rounded-3xl bg-[#fffaf2] p-6 text-center text-[#62564c]">
                  Orders will appear here after checkout.
                </p>
              )}
            </div>
          </section>
          ) : activeTab === "inventory" ? (
          <section className="rounded-4xl border border-black/10 bg-white p-6 shadow-xl shadow-orange-950/10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-3xl font-semibold tracking-tighter">
                  Product inventory
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#62564c]">
                  Stock shown here appears on the storefront and is decremented
                  when checkout creates an order. ShipStation sync uses
                  SHIP_STATION_INVENTORY_LOCATION_ID when set, otherwise it
                  tries the first ShipStation inventory location.
                </p>
                <p
                  className={
                    shipStationInventoryConfigured
                      ? "mt-2 text-sm font-semibold text-[#2f5f1e]"
                      : "mt-2 text-sm font-semibold text-[#8a1f1f]"
                  }
                >
                  ShipStation inventory sync is{" "}
                  {shipStationInventoryConfigured ? "configured" : "not configured"}.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <p className="rounded-full bg-[#fff2e4] px-4 py-2 text-sm font-bold text-[#a24b00]">
                  {products.length} variants
                </p>
                <div className="flex flex-wrap gap-2">
                  <form action={syncInventoryToShipStation}>
                    <button
                      type="submit"
                      className="rounded-full bg-[#171411] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#302821]"
                    >
                      Push to ShipStation
                    </button>
                  </form>
                  <form action={pullInventoryFromShipStation}>
                    <button
                      type="submit"
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-[#171411] transition hover:border-[#ea7500]/40 hover:bg-[#fff8ef]"
                    >
                      Pull from ShipStation
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              {products.map((product) => {
                const quantity = inventoryByProduct.get(product.id) ?? 0;
                const sync = inventorySyncByProduct.get(product.id);

                return (
                  <form
                    key={product.id}
                    action={updateInventory}
                    className="grid gap-3 rounded-3xl border border-black/10 bg-[#fffaf2] p-4 transition hover:border-[#ea7500]/30 hover:bg-white sm:grid-cols-[1fr_7rem_auto] sm:items-center"
                  >
                    <input type="hidden" name="productId" value={product.id} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{product.name}</p>
                        <span
                          className={
                            quantity > 0
                              ? "rounded-full bg-[#e8f5df] px-3 py-1 text-xs font-bold text-[#2f5f1e]"
                              : "rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-bold text-[#8a1f1f]"
                          }
                        >
                          {quantity > 0 ? `${quantity} in stock` : "Out of stock"}
                        </span>
                        <span
                          className={
                            sync?.shipStationInventorySyncStatus === "synced"
                              ? "rounded-full bg-[#e8f5df] px-3 py-1 text-xs font-bold text-[#2f5f1e]"
                              : sync?.shipStationInventorySyncStatus === "failed"
                                ? "rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-bold text-[#8a1f1f]"
                                : "rounded-full bg-white px-3 py-1 text-xs font-bold text-[#62564c]"
                          }
                        >
                          ShipStation{" "}
                          {sync?.shipStationInventorySyncStatus ?? "pending"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#62564c]">
                        {product.amount} · {product.id}
                      </p>
                      {sync?.shipStationInventorySyncedAt ? (
                        <p className="mt-1 text-xs text-[#62564c]">
                          Last synced{" "}
                          {sync.shipStationInventorySyncedAt.toLocaleString()}
                        </p>
                      ) : null}
                      {sync?.shipStationInventorySyncError ? (
                        <p className="mt-1 text-xs font-semibold text-[#8a1f1f]">
                          {sync.shipStationInventorySyncError}
                        </p>
                      ) : null}
                    </div>
                    <input
                      name="quantity"
                      type="number"
                      min={0}
                      defaultValue={quantity}
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-[#171411] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#302821]"
                    >
                      Save
                    </button>
                  </form>
                );
              })}
            </div>
          </section>
          ) : activeTab === "accounts" ? (
          <section className="rounded-4xl border border-black/10 bg-white p-6 shadow-xl shadow-orange-950/10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-3xl font-semibold tracking-tighter">
                  Account pricing
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#62564c]">
                  Enable special member pricing for individual accounts. Retail
                  pricing remains the default for everyone else.
                </p>
              </div>
              <p className="rounded-full bg-[#fff2e4] px-4 py-2 text-sm font-bold text-[#a24b00]">
                {userRows.length} accounts
              </p>
            </div>
            <div className="mt-6 grid gap-4">
              {userRows.map((user) => (
                <form
                  key={user.id}
                  action={updateMemberPricing}
                  className="grid gap-4 rounded-3xl border border-black/10 bg-[#fffaf2] p-4 transition hover:border-[#ea7500]/30 hover:bg-white sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{user.name}</p>
                      <span
                        className={
                          user.memberPricingEnabled
                            ? "rounded-full bg-[#e8f5df] px-3 py-1 text-xs font-bold text-[#2f5f1e]"
                            : "rounded-full bg-white px-3 py-1 text-xs font-bold text-[#62564c]"
                        }
                      >
                        {user.memberPricingEnabled ? "Member pricing" : "Retail pricing"}
                      </span>
                      {user.role === "admin" ? (
                        <span className="rounded-full bg-[#171411] px-3 py-1 text-xs font-bold text-white">
                          Admin
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-[#62564c]">{user.email}</p>
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#3b332d]">
                    <input
                      name="memberPricingEnabled"
                      type="checkbox"
                      defaultChecked={user.memberPricingEnabled}
                      className="h-4 w-4 accent-[#ea7500]"
                    />
                    Special member pricing
                  </label>
                  <button
                    type="submit"
                    className="rounded-full bg-[#171411] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#302821]"
                  >
                    Save
                  </button>
                </form>
              ))}
            </div>
          </section>
          ) : (
          <section className="rounded-4xl border border-black/10 bg-white p-6 shadow-xl shadow-orange-950/10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-3xl font-semibold tracking-tighter">
                  Referral partners
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#62564c]">
                  Create partner codes, set percentage discounts, and track
                  active order sales attributed to each referral partner.
                </p>
              </div>
              <p className="rounded-full bg-[#fff2e4] px-4 py-2 text-sm font-bold text-[#a24b00]">
                {referralPartnerRows.length} partners
              </p>
            </div>

            <form
              action={createReferralPartner}
              className="mt-6 grid gap-4 rounded-3xl border border-black/10 bg-[#fffaf2] p-4 lg:grid-cols-[1fr_1fr_10rem_8rem_auto] lg:items-end"
            >
              <label className="grid gap-2 text-sm font-semibold">
                Partner Name
                <input
                  name="name"
                  required
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-normal outline-none focus:border-[#ea7500]"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Partner Email
                <input
                  name="email"
                  type="email"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-normal outline-none focus:border-[#ea7500]"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Code
                <input
                  name="code"
                  required
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-normal uppercase outline-none focus:border-[#ea7500]"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Discount %
                <input
                  name="discountPercent"
                  type="number"
                  min={1}
                  max={100}
                  required
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-normal outline-none focus:border-[#ea7500]"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-[#171411] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#302821]"
              >
                Create
              </button>
            </form>

            <div className="mt-6 grid gap-5">
              {referralPartnerRows.length > 0 ? (
                referralPartnerRows.map((partner) => {
                  const codes = referralCodesByPartner.get(partner.id) ?? [];
                  const partnerTotals = referralTotalsByPartner.get(partner.id);

                  return (
                    <article
                      key={partner.id}
                      className="rounded-3xl border border-black/10 bg-[#fffaf2] p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div>
                          <h3 className="text-2xl font-semibold">
                            {partner.name}
                          </h3>
                          {partner.email ? (
                            <p className="mt-1 text-sm text-[#62564c]">
                              {partner.email}
                            </p>
                          ) : null}
                        </div>
                        <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-md">
                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a24b00]">
                              Orders
                            </p>
                            <p className="mt-1 text-xl font-semibold">
                              {partnerTotals?.orders ?? 0}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a24b00]">
                              Sales
                            </p>
                            <p className="mt-1 text-xl font-semibold">
                              {formatCents(partnerTotals?.salesCents ?? 0)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a24b00]">
                              Discounts
                            </p>
                            <p className="mt-1 text-xl font-semibold">
                              {formatCents(partnerTotals?.discountCents ?? 0)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3">
                        {codes.map((code) => {
                          const codeTotals = referralTotalsByCode.get(code.id);

                          return (
                            <form
                              key={code.id}
                              action={updateReferralCode}
                              className="grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-[1fr_8rem_auto_auto] md:items-center"
                            >
                              <input
                                type="hidden"
                                name="codeId"
                                value={code.id}
                              />
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold">{code.code}</p>
                                  <span
                                    className={
                                      code.isActive
                                        ? "rounded-full bg-[#e8f5df] px-3 py-1 text-xs font-bold text-[#2f5f1e]"
                                        : "rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-bold text-[#8a1f1f]"
                                    }
                                  >
                                    {code.isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-[#62564c]">
                                  {codeTotals?.orders ?? 0} orders ·{" "}
                                  {formatCents(codeTotals?.salesCents ?? 0)}{" "}
                                  sales ·{" "}
                                  {formatCents(codeTotals?.discountCents ?? 0)}{" "}
                                  discounts
                                </p>
                              </div>
                              <label className="grid gap-2 text-sm font-semibold">
                                Discount %
                                <input
                                  name="discountPercent"
                                  type="number"
                                  min={1}
                                  max={100}
                                  defaultValue={code.discountPercent}
                                  className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 font-normal outline-none focus:border-[#ea7500]"
                                />
                              </label>
                              <label className="flex items-center gap-3 rounded-2xl bg-[#fffaf2] px-4 py-3 text-sm font-semibold">
                                <input
                                  name="isActive"
                                  type="checkbox"
                                  defaultChecked={code.isActive}
                                  className="h-4 w-4 accent-[#ea7500]"
                                />
                                Active
                              </label>
                              <button
                                type="submit"
                                className="rounded-full bg-[#171411] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#302821]"
                              >
                                Save
                              </button>
                            </form>
                          );
                        })}
                      </div>

                      <form
                        action={createReferralCode}
                        className="mt-4 grid gap-3 rounded-2xl border border-black/10 bg-white p-4 md:grid-cols-[1fr_8rem_auto] md:items-end"
                      >
                        <input
                          type="hidden"
                          name="partnerId"
                          value={partner.id}
                        />
                        <label className="grid gap-2 text-sm font-semibold">
                          Add Code
                          <input
                            name="code"
                            required
                            className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 font-normal uppercase outline-none focus:border-[#ea7500]"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-semibold">
                          Discount %
                          <input
                            name="discountPercent"
                            type="number"
                            min={1}
                            max={100}
                            required
                            className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 font-normal outline-none focus:border-[#ea7500]"
                          />
                        </label>
                        <button
                          type="submit"
                          className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-[#171411] transition hover:border-[#ea7500]/40 hover:bg-[#fff8ef]"
                        >
                          Add Code
                        </button>
                      </form>
                    </article>
                  );
                })
              ) : (
                <p className="rounded-3xl bg-[#fffaf2] p-6 text-center text-[#62564c]">
                  Referral partners will appear here after you create one.
                </p>
              )}
            </div>
          </section>
          )}
        </div>
      </section>
    </main>
  );
}
