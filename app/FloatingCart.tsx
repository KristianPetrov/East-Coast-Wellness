"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  cartUpdatedEvent,
  getCartCount,
  getCartTotal,
  readCart,
  type CartItem,
} from "./cart";
import { formatPrice } from "./products";

export function FloatingCart() {
  const [items, setItems] = useState<CartItem[]>([]);

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

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm rounded-3xl border border-white/20 bg-[#171411] p-4 text-white shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff9b32]">
            Cart
          </p>
          <p className="mt-1 text-lg font-semibold">
            {count} {count === 1 ? "item" : "items"} • {formatPrice(total)}
          </p>
        </div>
        <Link
          href="/checkout"
          className="rounded-full bg-[#ea7500] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ff8a16]"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
