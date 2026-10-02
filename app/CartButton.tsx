"use client";

import { useEffect, useState } from "react";
import { cartUpdatedEvent, getCartCount, openCart, readCart } from "./cart";

/** Header bag icon with a live item count; opens the cart drawer. */
export function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getCartCount(readCart()));

    sync();
    window.addEventListener(cartUpdatedEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(cartUpdatedEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-ink/12 bg-bone/70 text-ink transition duration-300 hover:border-ink/25 hover:bg-bone active:scale-95"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="h-5 w-5"
        aria-hidden
      >
        <path
          d="M6 8h12l-1 12H7L6 8Z M9 8V6.5a3 3 0 0 1 6 0V8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 ? (
        <span
          key={count}
          className="cart-pop absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1 text-[10px] font-semibold text-white ring-2 ring-paper"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
