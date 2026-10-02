"use client";

import Image from "next/image";
import Link from "next/link";
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
  type Product,
} from "../products";
import { btnPrimary, Eyebrow, fieldInput, fieldLabel, Notice } from "../ui";
import { createOrder, type CheckoutResult } from "./actions";
import {
  shippingOptions,
  type ShippingMethod,
} from "@/lib/shipping";

const usStates = [
  ["", "Select state"],
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["DC", "Washington DC"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
] as const;

type CheckoutPageProps = {
  pricingTier: PricingTier;
  catalog: Product[];
};

export function CheckoutPage({ pricingTier, catalog }: CheckoutPageProps) {
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
        referralCode: String(formData.get("referralCode") ?? ""),
        shippingMethod: String(
          formData.get("shippingMethod") ?? "standard",
        ) as ShippingMethod,
        items: items.map((item) => ({
          id: item.productId,
          packageType: item.packageType,
          quantity: item.quantity,
        })),
      });

      setResult(orderResult);

      if (orderResult.ok) {
        saveCart([]);
        router.push(
          `/checkout/thank-you?orderNumber=${encodeURIComponent(
            orderResult.orderNumber,
          )}&email=${encodeURIComponent(orderResult.email)}`,
        );
      }
    });
  }

  const count = getCartCount(items);
  const subtotal = getCartTotal(items, pricingTier, catalog);
  const shippingPrice = shippingOptions[shippingMethod].priceCents / 100;
  const total = subtotal + shippingPrice;

  return (
    <main className="min-h-screen bg-paper pb-24 text-ink">
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <Link
          href="/store"
          className="group inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden>
            <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Continue shopping
        </Link>
        <div className="animate-rise mt-6">
          <Eyebrow>Checkout</Eyebrow>
          <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
            Shipping and <span className="text-gradient-copper italic">contact details.</span>
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Provide the information needed to prepare the order request. This
            checkout page does not provide medical guidance or dosing
            instructions.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-8">
        <form onSubmit={handleSubmit} autoComplete="on" className="grid gap-6">
          <CheckoutStep number={1} title="Contact">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={fieldLabel}>
                Full name
                <input name="name" required autoComplete="shipping name" className={fieldInput} />
              </label>
              <label className={fieldLabel}>
                Phone number
                <input name="phone" type="tel" required autoComplete="shipping tel" className={fieldInput} />
              </label>
            </div>
            <label className={fieldLabel}>
              Email address
              <input name="email" type="email" required autoComplete="shipping email" className={fieldInput} />
              <span className="text-xs font-normal text-faint">
                Your confirmation and payment details are sent here.
              </span>
            </label>
          </CheckoutStep>

          <CheckoutStep number={2} title="Shipping address">
            <label className={fieldLabel}>
              Street address
              <input
                name="address"
                required
                autoComplete="shipping address-line1"
                placeholder="Street address"
                className={fieldInput}
              />
            </label>
            <input
              name="address2"
              autoComplete="shipping address-line2"
              placeholder="Apartment, suite, unit, etc. (optional)"
              aria-label="Apartment, suite, or unit"
              className={fieldInput}
            />
            <div className="grid gap-5 sm:grid-cols-[1.3fr_1fr_0.8fr]">
              <label className={fieldLabel}>
                City
                <input name="city" required autoComplete="shipping address-level2" className={fieldInput} />
              </label>
              <label className={fieldLabel}>
                State
                <select name="state" required autoComplete="shipping address-level1" className={fieldInput}>
                  {usStates.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={fieldLabel}>
                ZIP code
                <input name="zip" required autoComplete="shipping postal-code" inputMode="numeric" className={fieldInput} />
              </label>
            </div>
          </CheckoutStep>

          <CheckoutStep number={3} title="Delivery">
            <div className="grid gap-3" role="radiogroup" aria-label="Shipping method">
              {Object.entries(shippingOptions).map(([value, option]) => {
                const isSelected = shippingMethod === value;

                return (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-4 text-sm transition ${
                      isSelected
                        ? "border-ink bg-white shadow-[0_0_0_1px_var(--color-ink)]"
                        : "border-ink/12 bg-bone hover:border-ink/30"
                    }`}
                  >
                    <span className="flex items-center gap-3 font-medium">
                      <input
                        name="shippingMethod"
                        type="radio"
                        value={value}
                        checked={isSelected}
                        onChange={() => setShippingMethod(value as ShippingMethod)}
                        className="h-4 w-4 accent-[var(--color-ink)]"
                      />
                      {option.label}
                    </span>
                    <span className="tabular-nums">{formatPrice(option.priceCents / 100)}</span>
                  </label>
                );
              })}
            </div>
          </CheckoutStep>

          <CheckoutStep number={4} title="Referral and payment">
            <label className={fieldLabel}>
              Referral code
              <input
                name="referralCode"
                autoComplete="off"
                placeholder="Optional"
                className={`${fieldInput} uppercase placeholder:normal-case`}
              />
              <span className="text-xs font-normal leading-5 text-faint">
                Active referral discounts are applied to the product subtotal
                when the order is created.
              </span>
            </label>
            <div className="grid gap-3 rounded-xl border border-ink/10 bg-paper p-5 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-copper-wash text-copper" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="M3 10h18" />
                </svg>
              </span>
              <div>
                <p className="font-medium">Manual payment by Venmo or Zelle</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  After you create the order, both options are shown on the
                  confirmation page and included in your order email.
                </p>
              </div>
            </div>
          </CheckoutStep>

          <p className="text-xs leading-5 text-faint">
            Products are intended for qualified laboratory research only and
            are not for human or animal consumption.
          </p>

          {result && !result.ok ? <Notice>{result.message}</Notice> : null}

          <button
            type="submit"
            disabled={isPending || items.length === 0}
            className={`${btnPrimary} w-full py-4! text-base!`}
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-bone/30 border-t-bone" aria-hidden />
                Creating order…
              </>
            ) : (
              "Create order"
            )}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-bone lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
              Order summary
            </p>
            <p className="text-sm text-muted">
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="max-h-[50vh] overflow-y-auto px-6">
            {items.length > 0 ? (
              <ul className="divide-y divide-ink/10">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <div className="relative flex h-16 w-14 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-ink/8">
                      <Image src={item.image} alt="" width={112} height={128} className="h-full w-full object-contain p-1" />
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-bone">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                        {item.amount} · {getProductPackageLabel(item.packageType)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium tabular-nums">
                      {formatPrice(getCartItemPrice(item, pricingTier, catalog) * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-10 text-center">
                <p className="font-display text-2xl">Your cart is empty.</p>
                <p className="mt-2 text-sm text-muted">
                  Add research products from the store before submitting
                  checkout details.
                </p>
                <Link href="/store" className="mt-5 inline-block rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium transition hover:bg-sand">
                  Browse the catalog
                </Link>
              </div>
            )}
          </div>
          <dl className="space-y-3 border-t border-ink/10 px-6 py-5 text-sm">
            <div className="flex items-center justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between text-muted">
              <dt>{shippingOptions[shippingMethod].label}</dt>
              <dd className="tabular-nums">{formatPrice(shippingPrice)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-ink/10 pt-4">
              <dt className="font-medium">Total</dt>
              <dd className="font-display text-4xl tabular-nums">{formatPrice(total)}</dd>
            </div>
            <p className="text-xs text-faint">
              Referral discounts, if any, are applied when the order is created.
            </p>
          </dl>
        </aside>
      </section>
    </main>
  );
}

function CheckoutStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-5 rounded-2xl border border-ink/10 bg-white/80 p-5 sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center gap-3" aria-hidden>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-copper/30 font-display text-base text-copper">
          {number}
        </span>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      {children}
    </fieldset>
  );
}
