import Link from "next/link";
import { getAuthSession } from "@/auth";
import { CartButton } from "./CartButton";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { StickyHeader } from "./StickyHeader";
import { btnPrimary } from "./ui";

const navLinks = [
  { href: "/store", label: "Shop" },
  { href: "/#quality", label: "Standards" },
  { href: "/#compliance", label: "Use notice" },
  { href: "/orders/lookup", label: "Track order" },
];

export async function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const session = await getAuthSession();
  const account = session?.user
    ? session.user.role === "admin"
      ? { href: "/admin", label: "Admin" }
      : { href: "/account/orders", label: "My orders" }
    : { href: "/login", label: "Sign in" };

  return (
    <StickyHeader overlay={overlay}>
      <Logo
        href="/"
        priority
        className={
          overlay
            ? "h-auto w-36 transition-[width] duration-500 sm:w-48 group-data-[scrolled=true]/hdr:w-32 sm:group-data-[scrolled=true]/hdr:w-40"
            : "h-auto w-32 sm:w-40"
        }
      />
      <nav
        aria-label="Primary"
        className="hidden items-center gap-8 text-[13px] font-medium tracking-wide text-muted lg:flex"
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="link-underline transition hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href={account.href}
          className="link-underline hidden text-[13px] font-medium tracking-wide text-muted transition hover:text-ink sm:inline-block"
        >
          {account.label}
        </Link>
        <div className="hidden sm:block">
          <Link href="/store" className={`${btnPrimary} px-5! py-2.5!`}>
            Shop the catalog
          </Link>
        </div>
        <CartButton />
        <MobileNav
          className="lg:hidden"
          links={[...navLinks, account]}
        />
      </div>
    </StickyHeader>
  );
}
