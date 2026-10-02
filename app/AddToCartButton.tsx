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
        `btn-sheen inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-white shadow-md transition duration-300 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#8b8178] disabled:shadow-none sm:px-5 sm:py-3 sm:text-sm ${
          added
            ? "bg-[#2f7d32] shadow-green-900/20"
            : "bg-[#ea7500] shadow-orange-900/20 hover:-translate-y-0.5 hover:bg-[#ff8a16] hover:shadow-lg hover:shadow-orange-900/30"
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
      {isOutOfStock ? "Out of Stock" : blocked ? "Stock Limit" : added ? "Added" : "Add to Cart"}
    </button>
  );
}
