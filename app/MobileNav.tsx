"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type MobileNavLink = {
  href: string;
  label: string;
};

type MobileNavProps = {
  links: MobileNavLink[];
  className?: string;
};

export function MobileNav({ links, className = "" }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const bar =
    "block h-0.5 w-5 rounded-full bg-current transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/12 bg-bone/70 text-ink backdrop-blur transition duration-300 hover:border-ink/25 hover:bg-bone active:scale-95"
      >
        <span className="grid gap-1.5" aria-hidden>
          <span className={`${bar} ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`${bar} ${isOpen ? "scale-x-0 opacity-0" : ""}`} />
          <span className={`${bar} ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </span>
      </button>

      <nav
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`absolute right-0 top-14 z-50 grid min-w-56 origin-top-right gap-1 rounded-2xl border border-ink/10 bg-bone p-2 text-sm font-medium text-ink shadow-[0_30px_60px_-20px_rgba(60,35,10,0.35)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
      >
        {links.map((link, index) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            onClick={() => setIsOpen(false)}
            style={{ transitionDelay: isOpen ? `${60 + index * 35}ms` : "0ms" }}
            className={`rounded-xl px-4 py-3 transition duration-300 hover:bg-sand hover:pl-5 ${
              isOpen ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
