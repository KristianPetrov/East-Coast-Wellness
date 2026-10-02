"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * A header that floats over the page and picks up a frosted background once
 * the visitor scrolls. The outer wrapper has no height so the hero beneath it
 * can extend underneath the header.
 */
export function StickyHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-40 h-0">
      <header
        data-scrolled={scrolled}
        className="group/hdr absolute inset-x-0 top-0 border-b border-transparent transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 data-[scrolled=true]:border-black/10 data-[scrolled=true]:bg-[#fffaf2]/80 data-[scrolled=true]:shadow-[0_8px_30px_-12px_rgba(60,30,0,0.18)] data-[scrolled=true]:backdrop-blur-xl"
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-[padding] duration-500 lg:px-8 ${
            scrolled ? "py-2.5" : "py-6"
          }`}
        >
          {children}
        </div>
      </header>
    </div>
  );
}
