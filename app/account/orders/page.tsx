import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/auth";
import { formatCents } from "@/lib/money";
import { getOrdersForUser } from "@/lib/orders";
import { OrderStatePills } from "@/app/orders/OrderDetails";
import { SiteFooter } from "@/app/SiteFooter";
import { SiteHeader } from "@/app/SiteHeader";
import { ArrowIcon, btnPrimary, Eyebrow } from "@/app/ui";
import { SignOutButton } from "../SignOutButton";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your East Coast Wellness order history.",
  robots: {
    index: false,
    follow: false,
  },
};

const orderDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});

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
    <>
      <SiteHeader />
      <main className="flex-1 bg-paper px-5 pb-24 pt-12 text-ink sm:px-6 sm:pt-16">
        <section className="mx-auto max-w-5xl">
          <div className="animate-rise flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>Account</Eyebrow>
              <h1 className="mt-5 font-display text-5xl tracking-tight sm:text-6xl">
                My <span className="text-gradient-copper italic">orders.</span>
              </h1>
              {session.user.email ? (
                <p className="mt-3 text-sm text-muted">Signed in as {session.user.email}</p>
              ) : null}
            </div>
            <div className="flex gap-3">
              <Link href="/store" className={btnPrimary}>
                Shop
              </Link>
              <SignOutButton />
            </div>
          </div>

          <div className="mt-12">
            {userOrders.length > 0 ? (
              <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-white/80">
                {userOrders.map((order, index) => (
                  <li key={order.id} className={index > 0 ? "border-t border-ink/10" : ""}>
                    <Link
                      href={`/orders/${order.orderNumber}?email=${encodeURIComponent(
                        order.customerEmail,
                      )}`}
                      className="group grid gap-3 px-6 py-5 transition hover:bg-bone sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{order.orderNumber}</p>
                        <p className="mt-0.5 text-sm text-muted">
                          <time dateTime={order.createdAt.toISOString()}>
                            {orderDateFormatter.format(order.createdAt)}
                          </time>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <OrderStatePills order={order} />
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span className="font-display text-2xl tabular-nums">
                          {formatCents(order.totalCents)}
                        </span>
                        <ArrowIcon className="h-4 w-4 text-faint group-hover:text-copper" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-ink/15 bg-bone p-12 text-center">
                <h2 className="font-display text-3xl">No orders yet</h2>
                <p className="mt-2 text-muted">
                  Your account orders will appear here after checkout.
                </p>
                <Link href="/store" className={`${btnPrimary} mt-6`}>
                  Browse the catalog
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
