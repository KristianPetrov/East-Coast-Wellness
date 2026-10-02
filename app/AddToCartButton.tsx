"use client";

import { useId, useState } from "react";
import { addProductToCart } from "./cart";
import type { PricingTier, Product, ProductPackageType } from "./products";

type AddToCartButtonProps = {
  product: Product;
  pricingTier: PricingTier;
  packageType: ProductPackageType;
  maxQuantity?: number;
  maxInventory?: number;
  className?: string;
};

export function AddToCartButton({
  product,
  pricingTier,
  packageType,
  maxQuantity,
  maxInventory,
  className,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const quantityId = useId();
  const isOutOfStock = maxQuantity !== undefined && maxQuantity <= 0;
  const selectedQuantity = Number(quantity);
  const isValidQuantity =
    Number.isSafeInteger(selectedQuantity) &&
    selectedQuantity > 0 &&
    (maxQuantity === undefined || selectedQuantity <= maxQuantity);

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <label htmlFor={quantityId} className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Quantity
        </label>
        <div className="flex items-center overflow-hidden rounded-xl border border-ink/12 bg-bone text-ink">
          <button
            type="button"
            aria-label={`Decrease quantity for ${product.name}`}
            disabled={isOutOfStock || !isValidQuantity || selectedQuantity <= 1}
            onClick={() => setQuantity(String(selectedQuantity - 1))}
            className="h-11 w-11 shrink-0 text-lg transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <input
            id={quantityId}
            type="number"
            min={1}
            max={maxQuantity}
            step={1}
            value={quantity}
            disabled={isOutOfStock}
            onChange={(event) => setQuantity(event.target.value)}
            onBlur={() => {
              if (!isValidQuantity) setQuantity("1");
            }}
            aria-label={`Quantity for ${product.name}`}
            className="h-11 w-full min-w-0 bg-transparent text-center text-base font-medium tabular-nums outline-none focus:ring-2 focus:ring-inset focus:ring-copper disabled:opacity-40"
          />
          <button
            type="button"
            aria-label={`Increase quantity for ${product.name}`}
            disabled={isOutOfStock || !isValidQuantity || (maxQuantity !== undefined && selectedQuantity >= maxQuantity)}
            onClick={() => setQuantity(String(selectedQuantity + 1))}
            className="h-11 w-11 shrink-0 text-lg transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        disabled={isOutOfStock || !isValidQuantity}
        onClick={() => {
          const didAdd = addProductToCart(
            product,
            pricingTier,
            packageType,
            maxQuantity,
            selectedQuantity,
            maxInventory,
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
    </div>
  );
}
