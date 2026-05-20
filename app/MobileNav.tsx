"use client";

import Link from "next/link";
import { useState } from "react";

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

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/80 text-[#171411] shadow-sm transition hover:bg-white"
      >
        <span className="grid gap-1.5" aria-hidden>
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      {isOpen ? (
        <nav className="absolute right-0 top-14 z-50 grid min-w-56 gap-1 rounded-3xl border border-black/10 bg-white p-2 text-sm font-bold text-[#171411] shadow-2xl shadow-orange-950/15">
          {links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="rounded-2xl px-4 py-3 transition hover:bg-[#fff2e4]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
