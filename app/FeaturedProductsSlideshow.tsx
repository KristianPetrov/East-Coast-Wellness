"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InventoryByProductId } from "@/lib/inventory";
import { ProductCard } from "./ProductCard";
import type { PricingTier, ProductGroup } from "./products";

type FeaturedProductsSlideshowProps = {
  groups: ProductGroup[];
  inventoryByProduct?: InventoryByProductId;
  pricingTier: PricingTier;
};

/**
 * Horizontal, scroll-snapping rail of featured products. Visitors can swipe,
 * scroll, or use the arrow buttons; nothing auto-advances under the cursor.
 */
export function FeaturedProductsSlideshow({
  groups,
  inventoryByProduct,
  pricingTier,
}: FeaturedProductsSlideshowProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const max = rail.scrollWidth - rail.clientWidth;
    setCanPrev(rail.scrollLeft > 4);
    setCanNext(rail.scrollLeft < max - 4);
    setProgress(max > 0 ? rail.scrollLeft / max : 1);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  function scrollByCard(direction: 1 | -1) {
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>("[data-rail-item]");
    if (!rail || !card) return;

    rail.scrollBy({ left: direction * (card.offsetWidth + 20), behavior: "smooth" });
  }

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div
        ref={railRef}
        className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
        aria-label="Featured products"
      >
        {groups.map((group) => (
          <div
            key={group.id}
            data-rail-item
            className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[23.5%]"
          >
            <ProductCard
              group={group}
              inventoryByProduct={inventoryByProduct}
              pricingTier={pricingTier}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-6">
        <div className="h-px flex-1 overflow-hidden bg-white/15">
          <div
            className="h-full origin-left bg-copper-bright transition-transform duration-300"
            style={{ transform: `scaleX(${Math.max(0.08, progress)})` }}
          />
        </div>
        <div className="flex gap-2">
          <RailButton direction="prev" disabled={!canPrev} onClick={() => scrollByCard(-1)} />
          <RailButton direction="next" disabled={!canNext} onClick={() => scrollByCard(1)} />
        </div>
      </div>
    </div>
  );
}

function RailButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";

  return (
    <button
      type="button"
      aria-label={isPrev ? "Previous products" : "Next products"}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition duration-300 hover:border-copper-bright hover:bg-white/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden>
        {isPrev ? (
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
