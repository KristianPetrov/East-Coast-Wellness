import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/auth";
import { formatCents } from "@/lib/money";
import { getOrdersForUser } from "@/lib/orders";
import { SignOutButton } from "../SignOutButton";

export const metadata: Metadata = {
  title: "My Orders | East Coast Wellness",
  description: "View your East Coast Wellness order history.",
};

export default async function Page() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  const userOrders = await getOrdersForUser(session.user.id);

  return (
    <main className="min-h-screen bg-[#f7f2ea] px-6 py-14 text-[#171411]">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#c95f00]">
              Account
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tighter">
              My orders.
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/store"
              className="rounded-full bg-[#ea7500] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c95f00]"
            >
              Shop
            </Link>
            <SignOutButton />
          </div>
        </div>

        <div className="mt-10 grid gap-4">
          {userOrders.length > 0 ? (
            userOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.orderNumber}?email=${encodeURIComponent(
                  order.customerEmail,
                )}`}
                className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-950/10"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-bold text-[#a24b00]">
                      {order.orderNumber}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {formatCents(order.totalCents)}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-[#62564c]">
                    Payment: {order.paymentStatus} · Shipping:{" "}
                    {order.shippingStatus}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-3xl border border-black/10 bg-white p-8 text-center">
              <h2 className="text-2xl font-semibold">No orders yet</h2>
              <p className="mt-2 text-[#62564c]">
                Your account orders will appear here after checkout.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
