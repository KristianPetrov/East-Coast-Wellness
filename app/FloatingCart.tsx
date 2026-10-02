"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  cartUpdatedEvent,
  clearCart,
  decrementCartItem,
  getCartItemPrice,
  getCartCount,
  getCartTotal,
  incrementCartItem,
  readCart,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "./cart";
import {
  formatPrice,
  getProductPackageLabel,
  type PricingTier,
  type Product,
} from "./products";

type FloatingCartProps = {
  pricingTier: PricingTier;
  catalog: Product[];
};

export function FloatingCart({ pricingTier, catalog }: FloatingCartProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const syncCart = () => setItems(readCart());

    syncCart();
    window.addEventListener(cartUpdatedEvent, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(cartUpdatedEvent, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const count = getCartCount(items);
  const total = getCartTotal(items, pricingTier, catalog);
  const hasItems = items.length > 0;

  // Re-key the summary line whenever the count changes so it pops.
  const previousCount = useRef(count);
  const [popKey, setPopKey] = useState(0);
  useEffect(() => {
    if (previousCount.current !== count) {
      if (count > previousCount.current) setPopKey((key) => key + 1);
      previousCount.current = count;
    }
  }, [count]);

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm text-white">
      <div className="overflow-hidden rounded-3xl border border-white/15 bg-[#171411]/95 shadow-2xl shadow-black/35 ring-1 ring-black/20 backdrop-blur-xl transition-shadow duration-500 hover:shadow-black/50">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="w-full bg-white/5 p-4 text-left transition duration-300 hover:bg-white/8"
          aria-expanded={isOpen}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff9b32]">
                Cart
              </p>
              <p
                key={popKey}
                className={`mt-0.5 origin-left text-base font-semibold ${popKey > 0 ? "cart-pop" : ""}`}
              >
                {count} {count === 1 ? "item" : "items"} • {formatPrice(total)}
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-[#ea7500] px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-950/30">
              {isOpen ? "Hide" : "Open"}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`h-3 w-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </button>

        <div
          inert={!isOpen}
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
          <div className="max-h-[62vh] overflow-y-auto p-3">
            {hasItems ? (
              <div className="grid gap-2.5">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="animate-rise rounded-2xl border border-white/10 bg-white/6 p-3 transition duration-300 hover:border-white/20 hover:bg-white/8"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-white/55">
                          {item.amount}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {getProductPackageLabel(item.packageType)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#ff9b32]">
                          {formatPrice(getCartItemPrice(item, pricingTier, catalog))} each
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.id)}
                        className="shrink-0 rounded-full bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white/70 transition hover:bg-white/15 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-white/10 bg-[#0f0c0a] p-1">
                        <button
                          type="button"
                          onClick={() => decrementCartItem(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-white transition hover:bg-white/10"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) =>
                            updateCartItemQuantity(
                              item.id,
                              Number(event.target.value),
                            )
                          }
                          className="h-8 w-11 bg-transparent text-center text-sm font-bold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          aria-label={`${item.name} quantity`}
                        />
                        <button
                          type="button"
                          onClick={() => incrementCartItem(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-white transition hover:bg-white/10"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-right text-sm font-semibold">
                        {formatPrice(
                          getCartItemPrice(item, pricingTier, catalog) * item.quantity,
                        )}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white/6 p-5 text-center">
                <h3 className="text-lg font-semibold">Your cart is empty.</h3>
                <p className="mt-1 text-sm leading-5 text-white/55">
                  Add products from the store and they will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                Subtotal
              </span>
              <span className="text-xl font-semibold">{formatPrice(total)}</span>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className={
                  hasItems
                    ? "btn-sheen rounded-full bg-[#ea7500] px-4 py-2.5 text-center text-sm font-bold text-white shadow-md shadow-orange-950/30 transition duration-300 hover:bg-[#ff8a16] active:scale-[0.98]"
                    : "pointer-events-none rounded-full bg-[#8b8178] px-4 py-2.5 text-center text-sm font-bold text-white"
                }
                aria-disabled={!hasItems}
              >
                Checkout
              </Link>
              <button
                type="button"
                onClick={clearCart}
                disabled={!hasItems}
                className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
              >
                Clear
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
