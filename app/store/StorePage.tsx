"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { InventoryByProductId } from "@/lib/inventory";
import { ProductCard } from "../ProductCard";
import {
  getProductPrice,
  groupProducts,
  type PricingTier,
  type Product,
} from "../products";
import { Eyebrow } from "../ui";

type StorePageProps = {
  catalog: Product[];
  inventoryByProduct: InventoryByProductId;
  pricingTier: PricingTier;
  initialCategory?: string;
  initialQuery?: string;
};

const categories = [
  { key: "all", label: "All" },
  { key: "molecule", label: "Molecules" },
  { key: "blend", label: "Blends" },
  { key: "compound", label: "Compounds" },
  { key: "supply", label: "Supplies" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];
type SortKey = "name" | "price-asc" | "price-desc" | "in-stock";

function toCategoryKey(value?: string): CategoryKey {
  return categories.some((category) => category.key === value)
    ? (value as CategoryKey)
    : "all";
}

export function StorePage({
  catalog,
  inventoryByProduct,
  pricingTier,
  initialCategory,
  initialQuery,
}: StorePageProps) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState<CategoryKey>(
    toCategoryKey(initialCategory),
  );
  const [sort, setSort] = useState<SortKey>("name");

  const productGroups = useMemo(() => groupProducts(catalog), [catalog]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: productGroups.length };

    for (const group of productGroups) {
      const key = toCategoryKey(group.category.toLowerCase().replace("research ", ""));
      counts[key] = (counts[key] ?? 0) + 1;
    }

    return counts;
  }, [productGroups]);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = catalog.filter((product) => {
      const inCategory =
        category === "all" || product.category.toLowerCase().includes(category);
      const matchesQuery =
        !normalizedQuery ||
        [product.name, product.amount, product.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return inCategory && matchesQuery;
    });
    const groups = groupProducts(matches);
    const startingPrice = (group: (typeof groups)[number]) =>
      Math.min(
        ...group.variants.map((variant) =>
          getProductPrice(variant, pricingTier, "vial"),
        ),
      );
    const stock = (group: (typeof groups)[number]) =>
      group.variants.reduce(
        (total, variant) => total + (inventoryByProduct[variant.id] ?? 0),
        0,
      );

    if (sort === "price-asc") {
      groups.sort((a, b) => startingPrice(a) - startingPrice(b));
    } else if (sort === "price-desc") {
      groups.sort((a, b) => startingPrice(b) - startingPrice(a));
    } else if (sort === "in-stock") {
      groups.sort((a, b) => Number(stock(b) > 0) - Number(stock(a) > 0));
    }

    return groups;
  }, [catalog, category, inventoryByProduct, pricingTier, query, sort]);

  return (
    <main className="min-h-screen bg-paper pb-32 text-ink">
      <section className="border-b border-ink/8 bg-[radial-gradient(ellipse_at_90%_0%,rgba(212,138,69,0.14),transparent_45%),linear-gradient(180deg,#fbf8f3_0%,#f3ece2_100%)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:px-8 lg:pb-16 lg:pt-20">
          <div className="animate-rise">
            <Eyebrow>The catalog</Eyebrow>
            <h1 className="mt-5 font-display text-5xl leading-[1] tracking-tight sm:text-7xl">
              Research <span className="text-gradient-copper italic">products.</span>
            </h1>
          </div>
          <p
            className="animate-rise max-w-lg leading-7 text-muted"
            style={{ "--delay": "120ms" } as CSSProperties}
          >
            Browse research-use molecules, blends, sprays, and supplies by name,
            amount, or category. Product information is for identification and
            cataloging only.
          </p>
        </div>
      </section>

      <div className="sticky top-[73px] z-30 border-b border-ink/8 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Filter by category"
          >
            {categories.map((option) => {
              const isActive = option.key === category;
              const optionCount = categoryCounts[option.key] ?? 0;

              if (option.key !== "all" && optionCount === 0) return null;

              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setCategory(option.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium transition duration-300 ${
                    isActive
                      ? "border-ink bg-ink text-bone"
                      : "border-ink/12 bg-bone text-ink-soft hover:border-ink/30"
                  }`}
                >
                  {option.label}
                  <span className={isActive ? "text-bone/60" : "text-faint"}>
                    {optionCount}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <label className="relative flex-1 lg:w-72 lg:flex-none">
              <span className="sr-only">Search catalog</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
                aria-hidden
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4 4" strokeLinecap="round" />
              </svg>
              <input
                id="product-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search BPC-157, NAD+, blends…"
                className="w-full rounded-full border border-ink/12 bg-bone py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-faint focus:border-copper focus:bg-white focus:ring-4 focus:ring-copper/12"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="h-full appearance-none rounded-full border border-ink/12 bg-bone py-2.5 pl-4 pr-9 text-sm text-ink-soft outline-none transition focus:border-copper focus:ring-4 focus:ring-copper/12"
              >
                <option value="name">Name A–Z</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="in-stock">In stock first</option>
              </select>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-faint">
          <p aria-live="polite">
            Showing {filteredGroups.length} of {productGroups.length} products
          </p>
          <p className="hidden sm:block">For research use only</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGroups.map((group, index) => (
            <div
              key={group.id}
              className="animate-rise"
              style={{ "--delay": `${Math.min(index, 8) * 50}ms` } as CSSProperties}
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
          <div className="animate-rise mt-4 rounded-2xl border border-dashed border-ink/15 bg-bone p-12 text-center">
            <h2 className="font-display text-3xl">No products found</h2>
            <p className="mt-2 text-muted">
              Try a different product name, amount, or category.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-6 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium transition hover:bg-sand"
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
