import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "Catalog",
    links: [
      { href: "/store", label: "All products" },
      { href: "/#products", label: "Featured" },
      { href: "/#quality", label: "Standards" },
    ],
  },
  {
    title: "Orders",
    links: [
      { href: "/orders/lookup", label: "Track an order" },
      { href: "/checkout", label: "Checkout" },
      { href: "/account/orders", label: "Order history" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
      { href: "/#compliance", label: "Use notice" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto bg-night text-white">
      <div className="rule-copper absolute inset-x-0 top-0 h-px" aria-hidden />
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="w-fit rounded-xl bg-bone px-4 py-3">
              <Image
                src="/ecw-logo-horizontal.PNG"
                alt="East Coast Wellness"
                width={853}
                height={274}
                className="h-auto w-44"
              />
            </div>
            <p className="mt-6 max-w-sm font-display text-2xl leading-snug text-white/85">
              A considered catalog for{" "}
              <span className="italic text-copper-bright">qualified research.</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-copper-bright">
                  {column.title}
                </p>
                <ul className="mt-4 grid gap-3 text-sm text-white/65">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="link-underline transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs leading-5 text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} East Coast Wellness</p>
          <p className="max-w-2xl sm:text-right">
            For research use only. Not for human or animal consumption. Not
            intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </div>
    </footer>
  );
}
