"use client";

import Link from "next/link";
import { Logo } from "../Logo";
import { MobileNav } from "../MobileNav";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";
import {
  cartUpdatedEvent,
  getCartCount,
  getCartItemPrice,
  getCartTotal,
  readCart,
  saveCart,
  type CartItem,
} from "../cart";
import {
  formatPrice,
  getProductPackageLabel,
  type PricingTier,
} from "../products";
import { createOrder, type CheckoutResult } from "./actions";
import {
  shippingOptions,
  type ShippingMethod,
} from "@/lib/orders";

const paymentMethodLabels = {
  venmo: "Venmo",
  zelle: "Zelle",
} as const;

type CheckoutPageProps = {
  pricingTier: PricingTier;
};

export function CheckoutPage({ pricingTier }: CheckoutPageProps) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard");
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [isPending, startTransition] = useTransition();

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
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const orderResult = await createOrder({
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        address: String(formData.get("address") ?? ""),
        address2: String(formData.get("address2") ?? ""),
        city: String(formData.get("city") ?? ""),
        state: String(formData.get("state") ?? ""),
        zip: String(formData.get("zip") ?? ""),
        shippingMethod: String(
          formData.get("shippingMethod") ?? "standard",
        ) as ShippingMethod,
        paymentMethod: String(formData.get("paymentMethod") ?? "venmo") as
          | "venmo"
          | "zelle",
        items: items.map((item) => ({
          id: item.productId,
          packageType: item.packageType,
          quantity: item.quantity,
        })),
      });

      setResult(orderResult);

      if (orderResult.ok) {
        saveCart([]);
        router.refresh();
      }
    });
  }

  const count = getCartCount(items);
  const subtotal = getCartTotal(items, pricingTier);
  const shippingPrice = shippingOptions[shippingMethod].priceCents / 100;
  const total = subtotal + shippingPrice;

  return (
    <main className="min-h-screen bg-[#f7f2ea] pb-32 text-[#171411]">
      <header className="border-b border-black/10 bg-[#fff8ef]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Logo href="/" priority />
          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="hidden rounded-full bg-[#ea7500] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c95f00] sm:inline-block"
            >
              Back to Store
            </Link>
            <MobileNav
              className="sm:hidden"
              links={[
                { href: "/store", label: "Back to Store" },
                { href: "/orders/lookup", label: "Order Lookup" },
                { href: "/login", label: "Login" },
              ]}
            />
          </div>
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

            <fieldset className="grid gap-3 rounded-3xl border border-black/10 bg-[#fffaf2] p-5">
              <legend className="px-2 text-sm font-bold uppercase tracking-[0.2em] text-[#a24b00]">
                Shipping
              </legend>
              {Object.entries(shippingOptions).map(([value, option]) => (
                <label
                  key={value}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#3b332d]"
                >
                  <span className="flex items-center gap-3">
                    <input
                      name="shippingMethod"
                      type="radio"
                      value={value}
                      checked={shippingMethod === value}
                      onChange={() => setShippingMethod(value as ShippingMethod)}
                      className="h-4 w-4 accent-[#ea7500]"
                    />
                    {option.label}
                  </span>
                  <span>{formatPrice(option.priceCents / 100)}</span>
                </label>
              ))}
            </fieldset>

            <fieldset className="grid gap-3 rounded-3xl border border-black/10 bg-[#fffaf2] p-5">
              <legend className="px-2 text-sm font-bold uppercase tracking-[0.2em] text-[#a24b00]">
                Manual Payment
              </legend>
              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#3b332d]"
                >
                  <input
                    name="paymentMethod"
                    type="radio"
                    value={value}
                    defaultChecked={value === "venmo"}
                    className="h-4 w-4 accent-[#ea7500]"
                  />
                  {label}
                </label>
              ))}
              <p className="text-sm leading-6 text-[#62564c]">
                Payment instructions are shown after checkout and included in
                the order email. Orders remain pending until payment is marked
                paid by the admin.
              </p>
            </fieldset>

            <button
              type="submit"
              disabled={isPending || items.length === 0}
              className="rounded-full bg-[#171411] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#302821] disabled:cursor-not-allowed disabled:bg-[#8b8178]"
            >
              {isPending ? "Creating Order..." : "Create Order"}
            </button>

            {result?.ok ? (
              <div className="rounded-2xl bg-[#e8f5df] p-4 text-sm font-semibold text-[#2f5f1e]">
                <p>Order {result.orderNumber} was created.</p>
                <Link
                  href={`/orders/${result.orderNumber}?email=${encodeURIComponent(
                    result.email,
                  )}`}
                  className="mt-2 inline-block underline"
                >
                  View order status
                </Link>
              </div>
            ) : null}

            {result && !result.ok ? (
              <p className="rounded-2xl bg-[#fff1f1] p-4 text-sm font-semibold text-[#8a1f1f]">
                {result.message}
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
                      {item.amount} • {getProductPackageLabel(item.packageType)} •
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(
                      getCartItemPrice(item, pricingTier) * item.quantity,
                    )}
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

          <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between text-sm text-white/65">
              <span>
                Subtotal · {count} {count === 1 ? "item" : "items"}
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/65">
              <span>{shippingOptions[shippingMethod].label}</span>
              <span>{formatPrice(shippingPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/65">Total</span>
              <span className="text-3xl font-semibold">{formatPrice(total)}</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
