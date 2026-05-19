"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  cartUpdatedEvent,
  clearCart,
  decrementCartItem,
  getCartCount,
  getCartTotal,
  incrementCartItem,
  readCart,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "./cart";
import { formatPrice } from "./products";

export function FloatingCart() {
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
  const total = getCartTotal(items);
  const hasItems = items.length > 0;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm text-white">
      <div className="overflow-hidden rounded-3xl border border-white/20 bg-[#171411] shadow-2xl shadow-black/35 transition-all duration-300">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="w-full bg-white/5 p-4 text-left transition hover:bg-white/8"
          aria-expanded={isOpen}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff9b32]">
                Cart
              </p>
              <p className="mt-0.5 text-base font-semibold">
                {count} {count === 1 ? "item" : "items"} • {formatPrice(total)}
              </p>
            </div>
            <span className="rounded-full bg-[#ea7500] px-4 py-2 text-xs font-bold text-white">
              {isOpen ? "Hide" : "Open"}
            </span>
          </div>
        </button>

        {isOpen ? (
          <>
          <div className="max-h-[62vh] overflow-y-auto p-3">
            {hasItems ? (
              <div className="grid gap-2.5">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/6 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-white/55">
                          {item.amount}
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#ff9b32]">
                          {formatPrice(item.price)} each
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
                        {formatPrice(item.price * item.quantity)}
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
                    ? "rounded-full bg-[#ea7500] px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#ff8a16]"
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
          </>
        ) : null}
      </div>
    </div>
  );
}
