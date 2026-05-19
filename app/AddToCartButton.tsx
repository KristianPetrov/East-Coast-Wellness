"use client";

import { useState } from "react";
import { addProductToCart } from "./cart";
import type { Product } from "./products";

type AddToCartButtonProps = {
  product: Product;
  maxQuantity?: number;
  className?: string;
};

export function AddToCartButton({
  product,
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
        const didAdd = addProductToCart(product, maxQuantity);

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
        "rounded-full bg-[#ea7500] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ff8a16] disabled:cursor-not-allowed disabled:bg-[#8b8178]"
      }
    >
      {isOutOfStock ? "Out of Stock" : blocked ? "Stock Limit" : added ? "Added" : "Add to Cart"}
    </button>
  );
}
