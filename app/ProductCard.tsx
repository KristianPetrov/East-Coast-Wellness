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

type ProductCardProps = {
  group: ProductGroup;
  theme?: "light" | "dark";
  inventoryByProduct?: InventoryByProductId;
  pricingTier: PricingTier;
};

export function ProductCard({
  group,
  theme = "light",
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

  const hasMultipleVariants = group.variants.length > 1;
  const canBuyKit = hasKitPricing(selected);
  const packageType = canBuyKit ? selectedPackageType : "vial";
  const packageSize = getProductPackageSize(packageType);
  const selectedPrice = getProductPrice(selected, pricingTier, packageType);
  const isDark = theme === "dark";
  const showsInventory = inventoryByProduct !== undefined;
  const selectedInventory = showsInventory
    ? (inventoryByProduct[selected.id] ?? 0)
    : undefined;
  const availablePackages =
    selectedInventory === undefined
      ? undefined
      : Math.floor(selectedInventory / packageSize);
  const isOutOfStock = availablePackages !== undefined && availablePackages <= 0;

  return (
    <article
      className={
        isDark
          ? "overflow-hidden rounded-3xl border border-white/10 bg-white/6 shadow-xl shadow-black/20 transition hover:border-[#ea7500]/60 hover:bg-white/9"
          : "overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-950/10"
      }
    >
      <div className={isDark ? "bg-white/95 p-2.5 sm:p-5" : "bg-[#fffaf2] p-2.5 sm:p-5"}>
        <Image
          src={selected.image}
          alt={`${group.name} ${selected.amount} research product`}
          width={640}
          height={640}
          className="aspect-square w-full rounded-2xl object-contain sm:rounded-3xl"
        />
      </div>

      <div className="flex flex-col gap-2 p-3 pb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-6 sm:pb-4">
        <div className="min-w-0 flex-1">
          <p
            className={
              isDark
                ? "text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff9b32] sm:text-xs sm:tracking-[0.2em]"
                : "text-[10px] font-bold uppercase tracking-[0.16em] text-[#c95f00] sm:text-xs sm:tracking-[0.2em]"
            }
          >
            {group.category}
          </p>
          <h2
            className={
              isDark
                ? "mt-1.5 text-base font-semibold leading-tight text-white sm:mt-3 sm:text-2xl"
                : "mt-1.5 text-base font-semibold leading-tight sm:mt-3 sm:text-2xl"
            }
          >
            {group.name}
          </h2>

          {hasMultipleVariants ? (
            <label
              className={
                isDark
                  ? "mt-2 block text-xs font-semibold text-white/70 sm:mt-4 sm:text-sm"
                  : "mt-2 block text-xs font-semibold text-[#62564c] sm:mt-4 sm:text-sm"
              }
            >
              Strength
              <select
                value={selectedId}
                onChange={(event) => {
                  setSelectedId(event.target.value);
                  setSelectedPackageType("vial");
                }}
                className={
                  isDark
                    ? "mt-1.5 w-full rounded-2xl border border-white/15 bg-[#0f0c0a] px-2.5 py-2 text-xs font-medium text-white outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/20 sm:mt-2 sm:px-4 sm:py-3 sm:text-sm"
                    : "mt-1.5 w-full rounded-2xl border border-black/10 bg-[#fffaf2] px-2.5 py-2 text-xs font-medium text-[#171411] outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15 sm:mt-2 sm:px-4 sm:py-3 sm:text-sm"
                }
              >
                {group.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.amount} —{" "}
                    {formatPrice(getProductPrice(variant, pricingTier, "vial"))}
                    {inventoryByProduct !== undefined &&
                    (inventoryByProduct[variant.id] ?? 0) <= 0
                      ? " — Out of stock"
                      : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p
              className={
                isDark
                  ? "mt-0.5 text-xs text-white/55 sm:mt-1 sm:text-base"
                  : "mt-0.5 text-xs text-[#74675d] sm:mt-1 sm:text-base"
              }
            >
              {selected.amount}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          {pricingTier === "member" ? (
            <span
              className={
                isDark
                  ? "rounded-full bg-[#ff9b32]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ffbd75]"
                  : "rounded-full bg-[#e8f5df] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2f5f1e]"
              }
            >
              Member
            </span>
          ) : null}
          <p
          className={
            isDark
              ? "w-fit shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#171411] sm:px-4 sm:py-2 sm:text-sm"
              : "w-fit shrink-0 rounded-full bg-[#fff2e4] px-3 py-1.5 text-xs font-bold text-[#bf5700] sm:px-4 sm:py-2 sm:text-sm"
          }
          >
            {formatPrice(selectedPrice)}
          </p>
          <span
            className={
              isDark
                ? "text-[11px] font-semibold text-white/55 sm:text-xs"
                : "text-[11px] font-semibold text-[#74675d] sm:text-xs"
            }
          >
            {getProductPackageLabel(packageType)}
          </span>
        </div>
      </div>

      {canBuyKit ? (
        <div className="px-3 pb-2 sm:px-6 sm:pb-4">
          <div
            className={
              isDark
                ? "grid grid-cols-2 gap-2 rounded-2xl bg-white/6 p-1"
                : "grid grid-cols-2 gap-2 rounded-2xl bg-[#fffaf2] p-1"
            }
          >
            {(["vial", "kit"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedPackageType(option)}
                className={
                  packageType === option
                    ? "rounded-xl bg-[#ea7500] px-2 py-2 text-xs font-bold text-white"
                    : isDark
                      ? "rounded-xl px-2 py-2 text-xs font-bold text-white/65 transition hover:bg-white/8 hover:text-white"
                      : "rounded-xl px-2 py-2 text-xs font-bold text-[#62564c] transition hover:bg-white hover:text-[#171411]"
                }
              >
                {getProductPackageLabel(option)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showsInventory && !isOutOfStock ? (
        <div className="px-3 pb-2 sm:px-6 sm:pb-4">
          <span
            className={
              isDark
                ? "inline-flex rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100 sm:px-3 sm:text-xs sm:tracking-[0.16em]"
                : "inline-flex rounded-full bg-[#e8f5df] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2f5f1e] sm:px-3 sm:text-xs sm:tracking-[0.16em]"
            }
          >
            {`${selectedInventory} ${selectedInventory === 1 ? "vial" : "vials"} left`}
            {packageType === "kit" && availablePackages !== undefined
              ? ` · ${availablePackages} ${availablePackages === 1 ? "kit" : "kits"} available`
              : ""}
          </span>
        </div>
      ) : null}

      <div
        className={
          isDark
            ? "flex items-center justify-between border-t border-white/10 p-3 sm:p-6 sm:pt-5"
            : "flex items-center justify-between border-t border-black/10 p-3 sm:p-6 sm:pt-5"
        }
      >
        <span
          className={
            isDark
              ? "hidden text-sm text-white/55 sm:inline"
              : "hidden text-sm text-[#74675d] sm:inline"
          }
        >
          {isDark ? "For research use only" : "Research use only"}
        </span>
        <AddToCartButton
          key={`${selected.id}-${packageType}`}
          product={selected}
          pricingTier={pricingTier}
          packageType={packageType}
          maxQuantity={availablePackages}
        />
      </div>
    </article>
  );
}
