"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  cartOpenEvent,
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

/**
 * Cart drawer that slides in from the right. It opens from the header bag
 * icon (via `openCart()`) or from the floating pill that appears once the
 * cart has items. Hidden on admin; checkout skips the pill since it shows
 * its own summary.
 */
export function FloatingCart({ pricingTier, catalog }: FloatingCartProps) {
  const pathname = usePathname();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const syncCart = () => setItems(readCart());
    const open = () => setIsOpen(true);

    syncCart();
    window.addEventListener(cartUpdatedEvent, syncCart);
    window.addEventListener("storage", syncCart);
    window.addEventListener(cartOpenEvent, open);

    return () => {
      window.removeEventListener(cartUpdatedEvent, syncCart);
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(cartOpenEvent, open);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const count = getCartCount(items);
  const total = getCartTotal(items, pricingTier, catalog);
  const hasItems = items.length > 0;

  // Re-key the pill whenever the count goes up so it pops.
  const previousCount = useRef(count);
  const [popKey, setPopKey] = useState(0);
  useEffect(() => {
    if (previousCount.current !== count) {
      if (count > previousCount.current) setPopKey((key) => key + 1);
      previousCount.current = count;
    }
  }, [count]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const showPill = hasItems && !pathname?.startsWith("/checkout");

  return (
    <>
      {showPill ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
          className={`animate-rise fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-white/10 bg-night/95 py-2 pl-2 pr-5 text-left text-white shadow-[0_24px_50px_-18px_rgba(0,0,0,0.6)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 ${
            isOpen ? "pointer-events-none opacity-0" : ""
          }`}
        >
          <span
            key={popKey}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-copper text-sm font-semibold ${popKey > 0 ? "cart-pop" : ""}`}
          >
            {count}
          </span>
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-copper-bright">
              Your cart
            </span>
            <span className="block text-sm font-medium">{formatPrice(total)}</span>
          </span>
        </button>
      ) : null}

      <div
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      >
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-night/40 backdrop-blur-[2px] transition-opacity duration-500 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Cart"
          className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper text-ink shadow-[-30px_0_60px_-30px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
                Your cart
              </p>
              <p className="mt-1 font-display text-2xl">
                {count} {count === 1 ? "item" : "items"}
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close cart"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/12 transition hover:bg-sand"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {hasItems ? (
              <ul className="divide-y divide-ink/10">
                {items.map((item) => {
                  const unitPrice = getCartItemPrice(item, pricingTier, catalog);

                  return (
                    <li key={item.id} className="flex gap-4 py-5">
                      <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-ink/8">
                        <Image
                          src={item.image}
                          alt=""
                          width={160}
                          height={200}
                          className="h-full w-full object-contain p-1.5"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-medium">{item.name}</h3>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted">
                              {item.amount} · {getProductPackageLabel(item.packageType)}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-medium">
                            {formatPrice(unitPrice * item.quantity)}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                          <div className="flex items-center rounded-full border border-ink/12 bg-bone">
                            <button
                              type="button"
                              onClick={() => decrementCartItem(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-base transition hover:bg-sand"
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(event) =>
                                updateCartItemQuantity(item.id, Number(event.target.value))
                              }
                              className="no-spin h-8 w-9 bg-transparent text-center text-sm font-medium outline-none"
                              aria-label={`${item.name} quantity`}
                            />
                            <button
                              type="button"
                              onClick={() => incrementCartItem(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-base transition hover:bg-sand"
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.id)}
                            className="text-xs font-medium text-muted underline-offset-4 transition hover:text-rust hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="mt-2 text-[11px] text-faint">
                          {formatPrice(unitPrice)} each
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <p className="font-display text-3xl">Your cart is empty.</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
                  Browse the catalog and add products. They will appear here.
                </p>
                <Link
                  href="/store"
                  onClick={() => setIsOpen(false)}
                  className="mt-6 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium transition hover:bg-sand"
                >
                  Browse the catalog
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-ink/10 bg-bone px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Subtotal
              </span>
              <span className="font-display text-3xl">{formatPrice(total)}</span>
            </div>
            <p className="mt-1 text-xs text-faint">
              Shipping and referral discounts are applied at checkout.
            </p>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                aria-disabled={!hasItems}
                className={
                  hasItems
                    ? "btn-sheen rounded-full bg-ink px-5 py-3.5 text-center text-sm font-medium tracking-wide text-bone transition hover:bg-ink-soft"
                    : "pointer-events-none rounded-full bg-faint px-5 py-3.5 text-center text-sm font-medium text-bone"
                }
              >
                Checkout
              </Link>
              <button
                type="button"
                onClick={clearCart}
                disabled={!hasItems}
                className="rounded-full border border-ink/15 px-5 py-3.5 text-sm font-medium transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
