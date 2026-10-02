"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Site header that picks up a frosted background once the visitor scrolls.
 * In `overlay` mode the wrapper has no height so a hero can sit underneath
 * it; otherwise it reserves its own space and is always solid.
 */
export function StickyHeader({
  children,
  overlay = false,
}: {
  children: ReactNode;
  overlay?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !overlay;

  return (
    <div className={`sticky top-0 z-40 ${overlay ? "h-0" : ""}`}>
      <header
        data-scrolled={scrolled}
        className={`group/hdr inset-x-0 top-0 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ${
          overlay ? "absolute" : "relative"
        } ${
          solid
            ? "border-ink/8 bg-paper/85 backdrop-blur-xl"
            : "border-transparent"
        } ${scrolled ? "shadow-[0_10px_30px_-18px_rgba(60,30,0,0.25)]" : ""}`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 transition-[padding] duration-500 sm:px-6 lg:px-8 ${
            !overlay ? "h-[72px]" : scrolled ? "py-2.5" : "py-5"
          }`}
        >
          {children}
        </div>
      </header>
    </div>
  );
}
