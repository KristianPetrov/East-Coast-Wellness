"use client";

import { useState } from "react";
import { addProductToCart } from "./cart";
import type { Product } from "./products";

type AddToCartButtonProps = {
  product: Product;
  className?: string;
};

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addProductToCart(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      className={
        className ??
        "rounded-full bg-[#ea7500] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ff8a16]"
      }
    >
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
