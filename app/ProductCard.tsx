"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { InventoryByProductId } from "@/lib/inventory";
import { AddToCartButton } from "./AddToCartButton";
import {
  formatPrice,
  getProductPackageLabel,
  getProductPackageSize,
  getProductPrice,
  hasKitPricing,
  type PricingTier,
  type ProductGroup,
  type ProductPackageType,
} from "./products";

const LOW_STOCK_THRESHOLD = 5;

type ProductCardProps = {
  group: ProductGroup;
  inventoryByProduct?: InventoryByProductId;
  pricingTier: PricingTier;
};

export function ProductCard({
  group,
  inventoryByProduct,
  pricingTier,
}: ProductCardProps) {
  const [selectedId, setSelectedId] = useState(group.variants[0].id);
  const [selectedPackageType, setSelectedPackageType] =
    useState<ProductPackageType>("vial");

  const selected = useMemo(
    () =>
      group.variants.find((variant) => variant.id === selectedId) ??
      group.variants[0],
    [group.variants, selectedId],
  );

  const canBuyKit = hasKitPricing(selected);
  const packageType = canBuyKit ? selectedPackageType : "vial";
  const packageSize = getProductPackageSize(packageType);
  const selectedPrice = getProductPrice(selected, pricingTier, packageType);
  const showsInventory = inventoryByProduct !== undefined;
  const selectedInventory = showsInventory
    ? (inventoryByProduct[selected.id] ?? 0)
    : undefined;
  const availablePackages =
    selectedInventory === undefined
      ? undefined
      : Math.floor(selectedInventory / packageSize);
  const isOutOfStock = availablePackages !== undefined && availablePackages <= 0;
  const isLowStock =
    selectedInventory !== undefined &&
    !isOutOfStock &&
    selectedInventory <= LOW_STOCK_THRESHOLD;
  const hasVariants = group.variants.length > 1;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition duration-500 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_30px_60px_-30px_rgba(60,35,10,0.4)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f6f1e9_80%)]">
        <Image
          key={selected.id}
          src={selected.image}
          alt={`${group.name} ${selected.amount} research product`}
          width={600}
          height={750}
          className="animate-fade h-full w-full object-contain p-6 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] sm:p-8"
        />
        <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
          {showsInventory ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur ${
                isOutOfStock
                  ? "bg-rust-wash/90 text-rust"
                  : isLowStock
                    ? "bg-amber-wash/90 text-amber-ink"
                    : "bg-white/85 text-sage"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
              {isOutOfStock
                ? "Out of stock"
                : isLowStock
                  ? `Only ${selectedInventory} left`
                  : "In stock"}
            </span>
          ) : (
            <span />
          )}
          {pricingTier === "member" ? (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-copper-bright">
              Member
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-copper sm:text-[11px]">
              {group.category}
            </p>
            <h2 className="mt-1.5 font-display text-xl leading-tight text-ink sm:text-[1.7rem]">
              {group.name}
            </h2>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-base font-medium tabular-nums text-ink sm:text-lg">
              {formatPrice(selectedPrice)}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-faint sm:text-[11px]">
              {getProductPackageLabel(packageType)}
            </p>
          </div>
        </div>

        {hasVariants ? (
          <fieldset className="min-w-0">
            <legend className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              Strength
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {group.variants.map((variant) => {
                const isSelected = variant.id === selected.id;
                const variantOut =
                  inventoryByProduct !== undefined &&
                  (inventoryByProduct[variant.id] ?? 0) <= 0;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedId(variant.id);
                      setSelectedPackageType("vial");
                    }}
                    className={`rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition duration-300 sm:px-3 ${
                      isSelected
                        ? "border-ink bg-ink text-bone"
                        : "border-ink/12 bg-bone text-ink-soft hover:border-ink/35"
                    } ${variantOut && !isSelected ? "text-faint line-through decoration-faint/60" : ""}`}
                  >
                    {variant.amount}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <p className="text-xs text-muted sm:text-sm">{selected.amount}</p>
        )}

        {canBuyKit ? (
          <div
            role="group"
            aria-label="Package size"
            className="grid grid-cols-2 gap-1 rounded-xl bg-paper p-1"
          >
            {(["vial", "kit"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={packageType === option}
                onClick={() => setSelectedPackageType(option)}
                className={
                  packageType === option
                    ? "rounded-lg bg-white px-2 py-2 text-xs font-medium text-ink shadow-[0_1px_2px_rgba(22,19,15,0.12)] transition duration-300"
                    : "rounded-lg px-2 py-2 text-xs font-medium text-muted transition duration-300 hover:text-ink"
                }
              >
                {getProductPackageLabel(option)}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-auto grid gap-2 border-t border-ink/8 pt-4">
          {packageType === "kit" && availablePackages !== undefined && !isOutOfStock ? (
            <span className="text-[11px] uppercase tracking-[0.14em] text-faint">
              {`${availablePackages} ${availablePackages === 1 ? "kit" : "kits"} available`}
            </span>
          ) : null}
          <AddToCartButton
            key={`${selected.id}-${packageType}`}
            product={selected}
            pricingTier={pricingTier}
            packageType={packageType}
            maxQuantity={availablePackages}
          />
        </div>
      </div>
    </article>
  );
}
