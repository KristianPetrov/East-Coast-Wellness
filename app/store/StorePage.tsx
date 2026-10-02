"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { Logo } from "../Logo";
import { MobileNav } from "../MobileNav";
import { ProductCard } from "../ProductCard";
import { groupProducts, type PricingTier, type Product } from "../products";
import type { InventoryByProductId }  from "@/lib/inventory";

type StorePageProps = {
  catalog: Product[];
  inventoryByProduct: InventoryByProductId;
  pricingTier: PricingTier;
};

export function StorePage({
  catalog,
  inventoryByProduct,
  pricingTier,
}: StorePageProps) {
  const [query, setQuery] = useState("");

  const productGroups = useMemo(() => groupProducts(catalog), [catalog]);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return productGroups;
    }

    return groupProducts(
      catalog.filter((product) =>
        [product.name, product.amount, product.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    );
  }, [catalog, productGroups, query]);

  return (
    <main className="min-h-screen bg-[#f7f2ea] pb-32 text-[#171411]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#fff8ef]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Logo href="/" priority />
          <div className="flex items-center gap-3">
            <Link
              href="/orders/lookup"
              className="hidden rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-[#171411] transition hover:bg-[#fff2e4] sm:inline-block"
            >
              Order Lookup
            </Link>
            <Link
              href="/login"
              className="hidden rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-[#171411] transition hover:bg-[#fff2e4] sm:inline-block"
            >
              Login
            </Link>
            <Link
              href="/checkout"
              className="hidden rounded-full bg-[#171411] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#302821] sm:inline-block"
            >
              Checkout
            </Link>
            <MobileNav
              className="sm:hidden"
              links={[
                { href: "/orders/lookup", label: "Order Lookup" },
                { href: "/login", label: "Login" },
                { href: "/checkout", label: "Checkout" },
              ]}
            />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <div className="animate-rise">
            <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.28em] text-[#c95f00]">
              <span className="h-px w-8 bg-current opacity-50" aria-hidden="true" />
              Store
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tighter sm:text-6xl">
              Search{" "}
              <span className="text-gradient-ember font-display text-[1.12em] font-normal italic tracking-tight">
                research
              </span>{" "}
              products.
            </h1>
          </div>
          <p
            className="animate-rise text-lg leading-8 text-[#62564c]"
            style={{ "--delay": "120ms" } as CSSProperties}
          >
            Browse research-use molecules, blends, sprays, and supplies by name,
            amount, or category. Product information is for identification and
            cataloging only.
          </p>
        </div>

        <div
          className="animate-rise mt-10 rounded-4xl border border-black/10 bg-white p-4 shadow-xl shadow-orange-950/10 transition-shadow duration-500 focus-within:shadow-2xl focus-within:shadow-orange-950/15"
          style={{ "--delay": "220ms" } as CSSProperties}
        >
          <label
            htmlFor="product-search"
            className="mb-3 block text-sm font-bold uppercase tracking-[0.2em] text-[#a24b00]"
          >
            Search Catalog
          </label>
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search BPC-15                                                7, NAD+, research blend..."
            className="w-full rounded-3xl border border-black/10 bg-[#fffaf2] px-5 py-4 text-lg outline-none transition placeholder:text-[#9a8f84] focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
          />
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-[#62564c]">
          <p>
            Showing {filteredGroups.length} of {productGroups.length} products
          </p>
          <p>For research use only</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {filteredGroups.map((group, index) => (
            <div
              key={group.id}
              className="animate-rise"
              style={{ "--delay": `${Math.min(index, 8) * 60}ms` } as CSSProperties}
            >
              <ProductCard
                group={group}
                inventoryByProduct={inventoryByProduct}
                pricingTier={pricingTier}
              />
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 ? (
          <div className="animate-rise mt-8 rounded-3xl border border-black/10 bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold">No products found</h2>
            <p className="mt-2 text-[#62564c]">
              Try a different product name, category, or amount.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
