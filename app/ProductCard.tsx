"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { InventoryByProductId } from "@/lib/inventory";
import { AddToCartButton } from "./AddToCartButton";
import { formatPrice, type ProductGroup } from "./products";

type ProductCardProps = {
  group: ProductGroup;
  theme?: "light" | "dark";
  inventoryByProduct?: InventoryByProductId;
};

export function ProductCard({
  group,
  theme = "light",
  inventoryByProduct,
}: ProductCardProps) {
  const [selectedId, setSelectedId] = useState(group.variants[0].id);

  const selected = useMemo(
    () =>
      group.variants.find((variant) => variant.id === selectedId) ??
      group.variants[0],
    [group.variants, selectedId],
  );

  const hasMultipleVariants = group.variants.length > 1;
  const isDark = theme === "dark";
  const selectedInventory = inventoryByProduct?.[selected.id];
  const showsInventory = selectedInventory !== undefined;
  const isOutOfStock = showsInventory && selectedInventory <= 0;

  return (
    <article
      className={
        isDark
          ? "overflow-hidden rounded-3xl border border-white/10 bg-white/6 shadow-xl shadow-black/20 transition hover:border-[#ea7500]/60 hover:bg-white/9"
          : "overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-950/10"
      }
    >
      <div className={isDark ? "bg-white/95 p-5" : "bg-[#fffaf2] p-5"}>
        <Image
          src={selected.image}
          alt={`${group.name} ${selected.amount} research product`}
          width={640}
          height={640}
          className="aspect-square w-full rounded-3xl object-contain"
        />
      </div>

      <div className="flex items-start justify-between gap-4 p-6 pb-4">
        <div className="min-w-0 flex-1">
          <p
            className={
              isDark
                ? "text-xs font-bold uppercase tracking-[0.2em] text-[#ff9b32]"
                : "text-xs font-bold uppercase tracking-[0.2em] text-[#c95f00]"
            }
          >
            {group.category}
          </p>
          <h2
            className={
              isDark
                ? "mt-3 text-2xl font-semibold text-white"
                : "mt-3 text-2xl font-semibold"
            }
          >
            {group.name}
          </h2>

          {hasMultipleVariants ? (
            <label
              className={
                isDark
                  ? "mt-4 block text-sm font-semibold text-white/70"
                  : "mt-4 block text-sm font-semibold text-[#62564c]"
              }
            >
              Strength
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                className={
                  isDark
                    ? "mt-2 w-full rounded-2xl border border-white/15 bg-[#0f0c0a] px-4 py-3 text-sm font-medium text-white outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/20"
                    : "mt-2 w-full rounded-2xl border border-black/10 bg-[#fffaf2] px-4 py-3 text-sm font-medium text-[#171411] outline-none focus:border-[#ea7500] focus:ring-4 focus:ring-[#ea7500]/15"
                }
              >
                {group.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.amount} — {formatPrice(variant.price)}
                    {inventoryByProduct?.[variant.id] === 0
                      ? " — Out of stock"
                      : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p
              className={
                isDark ? "mt-1 text-white/55" : "mt-1 text-[#74675d]"
              }
            >
              {selected.amount}
            </p>
          )}
        </div>

        <p
          className={
            isDark
              ? "shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#171411]"
              : "shrink-0 rounded-full bg-[#fff2e4] px-4 py-2 text-sm font-bold text-[#bf5700]"
          }
        >
          {formatPrice(selected.price)}
        </p>
      </div>

      {showsInventory ? (
        <div className="px-6 pb-4">
          <span
            className={
              isOutOfStock
                ? isDark
                  ? "inline-flex rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-red-200"
                  : "inline-flex rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8a1f1f]"
                : isDark
                  ? "inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100"
                  : "inline-flex rounded-full bg-[#e8f5df] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#2f5f1e]"
            }
          >
            {isOutOfStock
              ? "Out of stock"
              : `${selectedInventory} in stock`}
          </span>
        </div>
      ) : null}

      <div
        className={
          isDark
            ? "flex items-center justify-between border-t border-white/10 p-6 pt-5"
            : "flex items-center justify-between border-t border-black/10 p-6 pt-5"
        }
      >
        <span
          className={
            isDark ? "text-sm text-white/55" : "text-sm text-[#74675d]"
          }
        >
          {isDark ? "For research use only" : "Research use only"}
        </span>
        <AddToCartButton
          key={selected.id}
          product={selected}
          maxQuantity={selectedInventory}
        />
      </div>
    </article>
  );
}
