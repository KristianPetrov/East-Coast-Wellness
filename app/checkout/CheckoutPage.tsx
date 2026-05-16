"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  cartUpdatedEvent,
  getCartCount,
  getCartTotal,
  readCart,
  type CartItem,
} from "../cart";
import { formatPrice } from "../products";

export function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitted, setSubmitted] = useState(false);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const count = getCartCount(items);
  const total = getCartTotal(items);

  return (
    <main className="min-h-screen bg-[#f7f2ea] pb-32 text-[#171411]">
      <header className="border-b border-black/10 bg-[#fff8ef]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link href="/">
            <Image
              src="/ecw-logo-horizontal.PNG"
              alt="East Coast Wellness"
              width={832}
              height={225}
              className="h-auto w-48 sm:w-64"
              priority
            />
          </Link>
          <Link
            href="/store"
            className="rounded-full bg-[#ea7500] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c95f00]"
          >
            Back to Store
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#c95f00]">
            Checkout
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tighter sm:text-6xl">
            Shipping and contact details.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#62564c]">
            Provide the information needed to prepare the order request. This
            checkout page does not provide medical guidance or dosing
            instructions.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 grid gap-5 rounded-4xl border border-black/10 bg-white p-6 shadow-xl shadow-orange-950/10"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
                Full Name
                <input
                  name="name"
                  required
                  autoComplete="name"
                  className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
                Phone Number
                <input
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
              Email Address
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
              Shipping Address
              <input
                name="address"
                required
                autoComplete="shipping address-line1"
                placeholder="Street address"
                className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
              />
            </label>

            <input
              name="address2"
              autoComplete="shipping address-line2"
              placeholder="Apartment, suite, unit, etc. (optional)"
              className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
            />

            <div className="grid gap-5 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
                City
                <input
                  name="city"
                  required
                  autoComplete="shipping address-level2"
                  className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
                State
                <input
                  name="state"
                  required
                  autoComplete="shipping address-level1"
                  className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#3b332d]">
                ZIP Code
                <input
                  name="zip"
                  required
                  autoComplete="shipping postal-code"
                  className="rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-base font-normal outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
                />
              </label>
            </div>

            <div className="rounded-3xl bg-[#fff8ef] p-5 text-sm leading-6 text-[#62564c]">
              Products are intended for qualified laboratory research only and
              are not for human or animal consumption.
            </div>

            <button
              type="submit"
              className="rounded-full bg-[#171411] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#302821]"
            >
              Submit Checkout Details
            </button>

            {submitted ? (
              <p className="rounded-2xl bg-[#e8f5df] p-4 text-sm font-semibold text-[#2f5f1e]">
                Checkout details captured for this demo. Connect a backend or
                payment provider to process orders.
              </p>
            ) : null}
          </form>
        </div>

        <aside className="h-fit rounded-4xl border border-black/10 bg-[#171411] p-6 text-white shadow-2xl shadow-black/20 lg:sticky lg:top-6">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#ff9b32]">
            Order Summary
          </p>
          <div className="mt-5 space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-white/10 pb-4"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-white/55">
                      {item.amount} • Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-3xl bg-white/6 p-5 text-white/65">
                Your cart is empty. Add research products from the store before
                submitting checkout details.
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <span className="text-white/65">
              {count} {count === 1 ? "item" : "items"}
            </span>
            <span className="text-3xl font-semibold">{formatPrice(total)}</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
