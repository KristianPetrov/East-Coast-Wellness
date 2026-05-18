"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import type { ProductGroup } from "./products";

const AUTO_ADVANCE_MS = 5500;

type FeaturedProductsSlideshowProps = {
  groups: ProductGroup[];
};

export function FeaturedProductsSlideshow({
  groups,
}: FeaturedProductsSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const count = groups.length;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActiveIndex(((index % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused || count <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, count]);

  if (count === 0) {
    return null;
  }

  const activeGroup = groups[activeIndex];

  return (
    <div
      className="relative mt-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {groups.map((group) => (
            <div
              key={group.id}
              className="w-full shrink-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
            >
              <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-xl">
                <ProductCard group={group} theme="dark" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {count > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-4">
            <SlideButton direction="prev" label="Previous product" onClick={prev} />
            <SlideButton direction="next" label="Next product" onClick={next} />
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div
              className="flex flex-wrap items-center justify-center gap-2"
              role="tablist"
              aria-label="Featured products"
            >
              {groups.map((group, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Show ${group.name}`}
                    onClick={() => goTo(index)}
                    className={
                      isActive
                        ? "h-2.5 w-8 rounded-full bg-[#ff9b32] transition-all duration-300"
                        : "h-2.5 w-2.5 rounded-full bg-white/25 transition-all duration-300 hover:bg-white/45"
                    }
                  />
                );
              })}
            </div>

            <p className="text-center text-sm text-white/50">
              <span className="font-semibold text-white/80">{activeGroup.name}</span>
              <span className="mx-2 text-white/25">·</span>
              {activeIndex + 1} of {count}
            </p>

            <div className="h-0.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <div
                key={`${activeIndex}-${isPaused ? "paused" : "playing"}`}
                className="featured-slideshow-progress h-full origin-left rounded-full bg-[#ff9b32]/80"
                style={{
                  animationDuration: `${AUTO_ADVANCE_MS}ms`,
                  animationPlayState: isPaused ? "paused" : "running",
                }}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function SlideButton({
  direction,
  label,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#171411]/85 text-white shadow-lg backdrop-blur transition hover:border-[#ff9b32]/50 hover:bg-[#302821] sm:h-12 sm:w-12"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
        aria-hidden
      >
        {isPrev ? (
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
