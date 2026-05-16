"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AddToCartButton } from "../AddToCartButton";
import { formatPrice, products } from "../products";

export function StorePage() {
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.amount, product.category]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-[#f7f2ea] pb-32 text-[#171411]">
      <header className="border-b border-black/10 bg-[#fff8ef]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link href="/">
            <Image
              src="/ecw-logo-horizontal.PNG"
              alt="East Coast Wellness"
              width={832}
              height={225}
              className="h-auto w-48 sm:w-64"
              priority
            />
          </Link>
          <Link
            href="/checkout"
            className="rounded-full bg-[#171411] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#302821]"
          >
            Checkout
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#c95f00]">
              Store
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tighter sm:text-6xl">
              Search research products.
            </h1>
          </div>
          <p className="text-lg leading-8 text-[#62564c]">
            Browse research-use peptides, blends, sprays, and supplies by name,
            amount, or category. Product information is for identification and
            cataloging only.
          </p>
        </div>

        <div className="mt-10 rounded-4xl border border-black/10 bg-white p-4 shadow-xl shadow-orange-950/10">
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
            placeholder="Search BPC-157, NAD+, research blend..."
            className="w-full rounded-3xl border border-black/10 bg-[#fffaf2] px-5 py-4 text-lg outline-none transition placeholder:text-[#9a8f84] focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
          />
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-[#62564c]">
          <p>
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <p>For research use only</p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-950/10"
            >
              <div className="bg-[#fffaf2] p-5">
                <Image
                  src={product.image}
                  alt={`${product.name} ${product.amount} research product`}
                  width={640}
                  height={640}
                  className="aspect-square w-full rounded-3xl object-contain"
                />
              </div>
              <div className="flex items-start justify-between gap-4 p-6 pb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c95f00]">
                    {product.category}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-[#74675d]">{product.amount}</p>
                </div>
                <p className="rounded-full bg-[#fff2e4] px-4 py-2 text-sm font-bold text-[#bf5700]">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-black/10 p-6 pt-5">
                <span className="text-sm text-[#74675d]">
                  Research use only
                </span>
                <AddToCartButton product={product} />
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-black/10 bg-white p-8 text-center">
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
