"use client";

import { useState } from "react";
import { addProductToCart } from "./cart";
import type { PricingTier, Product, ProductPackageType } from "./products";

type AddToCartButtonProps = {
  product: Product;
  pricingTier: PricingTier;
  packageType: ProductPackageType;
  maxQuantity?: number;
  className?: string;
};

export function AddToCartButton({
  product,
  pricingTier,
  packageType,
  maxQuantity,
  className,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const isOutOfStock = maxQuantity !== undefined && maxQuantity <= 0;

  return (
    <button
      type="button"
      disabled={isOutOfStock}
      onClick={() => {
        const didAdd = addProductToCart(
          product,
          pricingTier,
          packageType,
          maxQuantity,
        );

        if (!didAdd) {
          setBlocked(true);
          window.setTimeout(() => setBlocked(false), 1600);
          return;
        }

        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      className={
        className ??
        `btn-sheen inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium tracking-wide text-white transition duration-300 active:scale-95 disabled:cursor-not-allowed disabled:bg-faint sm:py-3 sm:text-sm ${
          added
            ? "bg-sage"
            : blocked
              ? "bg-amber-ink"
              : "bg-ink hover:-translate-y-0.5 hover:bg-copper"
        }`
      }
    >
      {added ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="draw-check h-3.5 w-3.5"
          aria-hidden
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      {isOutOfStock ? "Sold out" : blocked ? "Stock limit reached" : added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
