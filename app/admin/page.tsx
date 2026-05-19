import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { getAuthSession } from "@/auth";
import { db } from "@/db";
import { orderItems, orders, productInventory } from "@/db/schema";
import { products } from "@/app/products";
import { formatCents } from "@/lib/money";
import { updateInventory, updateOrderStatus } from "./actions";

export const metadata: Metadata = {
  title: "Admin Dashboard | East Coast Wellness",
  description: "Manage East Coast Wellness orders and inventory.",
};

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const session = await getAuthSession();
  const { tab } = await searchParams;
  const activeTab = tab === "inventory" ? "inventory" : "orders";

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

  const [inventoryRows, orderRows, itemRows] = await Promise.all([
    db.select().from(productInventory),
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(orderItems),
  ]);
  const inventoryByProduct = new Map(
    inventoryRows.map((row) => [row.productId, row.quantity]),
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
          <div className="grid gap-2 sm:grid-cols-2">
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
                          <p className="text-sm font-bold text-[#a24b00]">
                            {order.orderNumber}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold">
                            {order.customerName}
                          </h3>
                          <p className="mt-1 text-sm text-[#62564c]">
                            {order.customerEmail} · {order.customerPhone}
                          </p>
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
          ) : (
          <section className="rounded-4xl border border-black/10 bg-white p-6 shadow-xl shadow-orange-950/10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-3xl font-semibold tracking-tighter">
                  Product inventory
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#62564c]">
                  Stock shown here appears on the storefront and is decremented
                  when checkout creates an order.
                </p>
              </div>
              <p className="rounded-full bg-[#fff2e4] px-4 py-2 text-sm font-bold text-[#a24b00]">
                {products.length} variants
              </p>
            </div>
            <div className="mt-6 grid gap-4">
              {products.map((product) => {
                const quantity = inventoryByProduct.get(product.id) ?? 0;

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
                      </div>
                      <p className="mt-1 text-sm text-[#62564c]">
                        {product.amount} · {product.id}
                      </p>
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
          )}
        </div>
      </section>
    </main>
  );
}
