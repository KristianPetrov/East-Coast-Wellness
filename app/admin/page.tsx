import type { Metadata } from "next";
import Image from "next/image";
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
import { getPriceOverrides, getProductsWithPrices } from "@/lib/pricing";
import { isShipStationEnabled } from "@/lib/shipstation";
import { SignOutButton } from "@/app/account/SignOutButton";
import { btnPrimary } from "@/app/ui";
import { AccountsPanel } from "./panels/AccountsPanel";
import {
  InventoryPanel,
  LOW_STOCK_THRESHOLD,
  type StockFilter,
} from "./panels/InventoryPanel";
import { OrdersPanel, type OrderFilter } from "./panels/OrdersPanel";
import { PricesPanel } from "./panels/PricesPanel";
import { ReferralsPanel, type ReferralTotals } from "./panels/ReferralsPanel";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage East Coast Wellness orders and inventory.",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{ tab?: string; status?: string; stock?: string; q?: string }>;
};

type Tab = "orders" | "inventory" | "prices" | "accounts" | "referrals";

const orderFilters: OrderFilter[] = ["all", "payment", "ship", "shipped", "cancelled"];
const stockFilters: StockFilter[] = ["all", "alerts", "out"];

function NavIcon({ tab }: { tab: Tab }) {
  const paths: Record<Tab, string> = {
    orders: "M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Zm4 0V6a3 3 0 0 1 6 0v1",
    inventory: "M4 8l8-4 8 4-8 4-8-4Zm0 0v8l8 4 8-4V8M12 12v8",
    prices: "M4 12V5a1 1 0 0 1 1-1h7l8 8-8 8-8-8Zm4.5-4.5h.01",
    accounts: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
    referrals: "M8 12h8M10 8H7a4 4 0 0 0 0 8h3m4-8h3a4 4 0 0 1 0 8h-3",
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px] shrink-0" aria-hidden>
      <path d={paths[tab]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function Page({ searchParams }: PageProps) {
  const session = await getAuthSession();
  const { tab, status, stock, q } = await searchParams;
  const activeTab: Tab =
    tab === "inventory" ||
    tab === "prices" ||
    tab === "accounts" ||
    tab === "referrals"
      ? tab
      : "orders";
  const query = q?.trim() || undefined;

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-14 text-ink">
        <section className="max-w-md rounded-2xl border border-ink/10 bg-white p-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">Admin</p>
          <h1 className="mt-4 font-display text-4xl tracking-tight">Admin access required.</h1>
          <p className="mt-3 text-muted">
            Sign in with the admin email configured in ADMIN_EMAIL.
          </p>
          <Link href="/" className={`${btnPrimary} mt-8`}>
            Back to storefront
          </Link>
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
    priceOverrideRows,
    pricedProducts,
  ] = await Promise.all([
    db.select().from(productInventory),
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(orderItems),
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(referralPartners).orderBy(desc(referralPartners.createdAt)),
    db.select().from(referralCodes).orderBy(desc(referralCodes.createdAt)),
    getPriceOverrides(),
    getProductsWithPrices(),
  ]);
  const pricedProductById = new Map(
    pricedProducts.map((product) => [product.id, product]),
  );
  const customPriceProductIds = new Set(
    priceOverrideRows.map((row) => row.productId),
  );
  const inventoryByProduct = new Map(
    inventoryRows.map((row) => [row.productId, row.quantity]),
  );
  const outOfStockCount = products.filter(
    (product) => (inventoryByProduct.get(product.id) ?? 0) <= 0,
  ).length;
  const lowStockCount = products.filter((product) => {
    const quantity = inventoryByProduct.get(product.id) ?? 0;
    return quantity > 0 && quantity <= LOW_STOCK_THRESHOLD;
  }).length;
  const shipStationEnabled = isShipStationEnabled();
  const shipStationInventoryLocationId =
    process.env.SHIP_STATION_INVENTORY_LOCATION_ID?.trim();
  const shipStationInventoryConfigured = Boolean(
    shipStationEnabled &&
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
  const sumTotals = (matching: typeof orderRows): ReferralTotals => ({
    orders: matching.length,
    salesCents: matching.reduce((total, order) => total + order.totalCents, 0),
    discountCents: matching.reduce(
      (total, order) => total + order.referralDiscountCents,
      0,
    ),
  });
  const referralTotalsByPartner = new Map(
    referralPartnerRows.map((partner) => [
      partner.id,
      sumTotals(
        activeReferralOrders.filter((order) => order.referralPartnerId === partner.id),
      ),
    ]),
  );
  const referralTotalsByCode = new Map(
    referralCodeRows.map((code) => [
      code.id,
      sumTotals(activeReferralOrders.filter((order) => order.referralCodeId === code.id)),
    ]),
  );
  const awaitingActionCount = orderRows.filter(
    (order) =>
      order.orderStatus !== "cancelled" &&
      (order.paymentStatus === "pending" || order.shippingStatus === "pending"),
  ).length;

  const navItems: { tab: Tab; label: string; href: string; badge?: number; alert?: boolean }[] = [
    { tab: "orders", label: "Orders", href: "/admin", badge: awaitingActionCount, alert: awaitingActionCount > 0 },
    {
      tab: "inventory",
      label: "Inventory",
      href: "/admin?tab=inventory",
      badge: outOfStockCount + lowStockCount,
      alert: outOfStockCount > 0,
    },
    { tab: "prices", label: "Prices", href: "/admin?tab=prices" },
    { tab: "accounts", label: "Accounts", href: "/admin?tab=accounts", badge: userRows.length },
    { tab: "referrals", label: "Referrals", href: "/admin?tab=referrals", badge: referralPartnerRows.length },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="hidden bg-night text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="px-6 pb-6 pt-7">
          <Link href="/" className="block w-fit rounded-lg bg-bone px-3 py-2">
            <Image
              src="/ecw-logo-horizontal.PNG"
              alt="East Coast Wellness"
              width={853}
              height={274}
              className="h-auto w-36"
            />
          </Link>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-copper-bright">
            Admin console
          </p>
        </div>
        <nav aria-label="Admin" className="grid gap-1 px-3">
          {navItems.map((item) => {
            const isActive = item.tab === activeTab;

            return (
              <Link
                key={item.tab}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <NavIcon tab={item.tab} />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${
                      item.alert ? "bg-copper text-white" : "bg-white/10 text-white/60"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 px-6 py-5">
          <Link
            href="/store"
            className="flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            View storefront
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5" aria-hidden>
              <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="truncate text-xs text-white/40">{session.user.email}</p>
            <SignOutButton className="shrink-0 text-xs font-medium text-white/60 transition hover:text-white" />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-5 py-3">
            <Link href="/">
              <Image
                src="/ecw-logo-horizontal.PNG"
                alt="East Coast Wellness"
                width={853}
                height={274}
                className="h-auto w-32"
              />
            </Link>
            <Link href="/store" className="text-sm font-medium text-muted hover:text-ink">
              Storefront
            </Link>
          </div>
          <nav
            aria-label="Admin"
            className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map((item) => {
              const isActive = item.tab === activeTab;

              return (
                <Link
                  key={item.tab}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-ink text-bone" : "text-muted hover:bg-white"
                  }`}
                >
                  {item.label}
                  {item.alert && item.badge ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-copper" aria-label="needs attention" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
          {activeTab === "orders" ? (
            <OrdersPanel
              orderRows={orderRows}
              itemRows={itemRows}
              filter={orderFilters.includes(status as OrderFilter) ? (status as OrderFilter) : "all"}
              query={query}
              shipStationEnabled={shipStationEnabled}
              lowStockCount={lowStockCount}
              outOfStockCount={outOfStockCount}
            />
          ) : activeTab === "inventory" ? (
            <InventoryPanel
              inventoryRows={inventoryRows}
              stockFilter={stockFilters.includes(stock as StockFilter) ? (stock as StockFilter) : "all"}
              query={query}
              shipStationEnabled={shipStationEnabled}
              shipStationInventoryConfigured={shipStationInventoryConfigured}
            />
          ) : activeTab === "prices" ? (
            <PricesPanel
              pricedProductById={pricedProductById}
              customPriceProductIds={customPriceProductIds}
              query={query}
            />
          ) : activeTab === "accounts" ? (
            <AccountsPanel userRows={userRows} query={query} />
          ) : (
            <ReferralsPanel
              partners={referralPartnerRows}
              codesByPartner={referralCodesByPartner}
              totalsByPartner={referralTotalsByPartner}
              totalsByCode={referralTotalsByCode}
            />
          )}
          <div className="mt-12 flex justify-end border-t border-ink/8 pt-6 lg:hidden">
            <SignOutButton />
          </div>
        </main>
      </div>
    </div>
  );
}
