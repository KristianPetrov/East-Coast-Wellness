import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getInventoryByProductId } from "@/lib/inventory";
import { getCurrentPricingTier } from "@/lib/member-pricing";
import { getProductsWithPrices } from "@/lib/pricing";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { FeaturedProductsSlideshow } from "./FeaturedProductsSlideshow";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { getFeaturedProductGroups, groupProducts } from "./products";
import { Reveal } from "./Reveal";
import { StickyHeader } from "./StickyHeader";

export const metadata: Metadata = {
  title: "Research-Use Molecule Store",
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: `${siteConfig.name} | Research-Use Molecule Store`,
    description: siteConfig.description,
  },
  twitter: {
    title: `${siteConfig.name} | Research-Use Molecule Store`,
    description: siteConfig.description,
  },
};

const standards = [
  "Research-use-only labeling",
  "Batch documentation available",
  "Temperature-conscious fulfillment",
  "Responsive client support",
];

function Eyebrow({
  children,
  className = "text-[#c95f00]",
  center = false,
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-sm font-bold uppercase tracking-[0.28em] ${
        center ? "justify-center" : ""
      } ${className}`}
    >
      <span className="h-px w-8 bg-current opacity-50" aria-hidden="true" />
      {children}
    </p>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function Home() {
  const [inventoryByProduct, pricingTier, catalog] = await Promise.all([
    getInventoryByProductId(),
    getCurrentPricingTier(),
    getProductsWithPrices(),
  ]);
  const featuredProductGroups = getFeaturedProductGroups(groupProducts(catalog));
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
      logo: absoluteUrl(siteConfig.logo),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
  ];

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f7f2ea] text-[#171411]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <StickyHeader>
        <Logo
          priority
          className="h-auto w-48 transition-[width] duration-500 sm:w-64 group-data-[scrolled=true]/hdr:w-40 sm:group-data-[scrolled=true]/hdr:w-44"
        />
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#5f544a] md:flex">
          <a href="#products" className="link-underline transition hover:text-[#171411]">
            Featured
          </a>
          <a href="#quality" className="link-underline transition hover:text-[#171411]">
            Quality
          </a>
          <a href="#compliance" className="link-underline transition hover:text-[#171411]">
            Compliance
          </a>
          <Link
            href="/orders/lookup"
            className="link-underline transition hover:text-[#171411]"
          >
            Order Lookup
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full border border-black/10 bg-white/60 px-5 py-3 text-sm font-semibold text-[#171411] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:inline-block"
          >
            Login
          </Link>
          <Link
            href="/store"
            className="btn-sheen rounded-full bg-[#ea7500] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#c95f00] hover:shadow-xl hover:shadow-orange-900/30"
          >
            Shop Research
          </Link>
          <MobileNav
            className="md:hidden"
            links={[
              { href: "#products", label: "Featured" },
              { href: "#quality", label: "Quality" },
              { href: "#compliance", label: "Compliance" },
              { href: "/orders/lookup", label: "Order Lookup" },
              { href: "/login", label: "Login" },
              { href: "/store", label: "Shop Research" },
            ]}
          />
        </div>
      </StickyHeader>

      <section className="grain relative border-b border-black/10 bg-[radial-gradient(circle_at_top_right,rgba(234,117,0,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,172,74,0.14),transparent_36%),linear-gradient(135deg,#fffaf2_0%,#efe4d6_100%)]">
        <div
          className="pointer-events-none absolute -right-40 -top-40 hidden h-[44rem] w-[44rem] rounded-full border border-[#ea7500]/15 lg:block"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 -top-20 hidden h-[34rem] w-[34rem] rounded-full border border-[#ea7500]/10 lg:block"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-32 sm:pt-36 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-44">
          <div className="flex flex-col justify-center">
            <p
              className="animate-rise mb-6 flex w-fit items-center gap-3 rounded-full border border-[#ea7500]/30 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#a24b00] shadow-sm backdrop-blur"
              style={{ "--delay": "100ms" } as React.CSSProperties}
            >
              <span className="status-dot relative h-2 w-2 rounded-full bg-[#ea7500]" aria-hidden="true" />
              Premium research supply
            </p>
            <h1
              className="animate-rise max-w-3xl text-5xl font-semibold tracking-tighter text-[#171411] sm:text-6xl lg:text-7xl"
              style={{ "--delay": "200ms" } as React.CSSProperties}
            >
              Precision{" "}
              <span className="text-gradient-ember pr-1 font-display text-[1.12em] font-normal italic tracking-tight">
                molecule catalog
              </span>{" "}
              for qualified research.
            </h1>
            <p
              className="animate-rise mt-6 max-w-2xl text-lg leading-8 text-[#5f544a]"
              style={{ "--delay": "320ms" } as React.CSSProperties}
            >
              East Coast Wellness offers a refined shopping experience for
              research-use molecules, blends, sprays, and reconstitution
              solutions with clear documentation and compliant product
              presentation.
            </p>
            <div
              className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ "--delay": "440ms" } as React.CSSProperties}
            >
              <Link
                href="/store"
                className="group btn-sheen inline-flex items-center justify-center gap-2 rounded-full bg-[#171411] px-7 py-4 text-center text-sm font-bold text-white shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#302821] hover:shadow-xl hover:shadow-black/25"
              >
                Browse Store
                <ArrowIcon />
              </Link>
              <a
                href="#compliance"
                className="rounded-full border border-black/15 bg-white/50 px-7 py-4 text-center text-sm font-bold text-[#171411] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              >
                Read Use Notice
              </a>
            </div>
            <p
              className="animate-rise mt-6 max-w-xl text-sm leading-6 text-[#786b60]"
              style={{ "--delay": "560ms" } as React.CSSProperties}
            >
              Products displayed on this site are intended for laboratory
              research only. They are not offered for human or animal
              consumption, diagnosis, treatment, cure, or prevention of disease.
            </p>
          </div>

          <div
            className="animate-scale-in relative"
            style={{ "--delay": "300ms" } as React.CSSProperties}
          >
            <div className="absolute -left-8 top-16 hidden h-28 w-28 rounded-full bg-[#ea7500]/25 blur-3xl lg:block" />
            <div className="absolute -bottom-10 right-4 hidden h-32 w-32 rounded-full bg-[#ffac4a]/30 blur-3xl lg:block" />
            <div className="float-slow relative rounded-4xl border border-white/60 bg-white/90 p-4 shadow-2xl shadow-black/25 ring-1 ring-black/5">
              <div className="overflow-hidden rounded-[1.45rem]">
                <Image
                  src="/ecw-reconsitution-vials.PNG"
                  alt="East Coast Wellness reconstitution solution vials"
                  width={1024}
                  height={512}
                  className="object-cover"
                  priority
                />
              </div>
              <div
                className="animate-rise relative mt-3 rounded-2xl border border-white/20 bg-[#171411] px-5 py-3.5 text-white sm:absolute sm:bottom-6 sm:left-6 sm:right-6 sm:mt-0 sm:bg-black/65 shadow-xl backdrop-blur-md"
                style={{ "--delay": "900ms" } as React.CSSProperties}
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#ffac4a]">
                  Research catalog
                </p>
                <p className="mt-1 text-lg font-semibold sm:text-xl">
                  Vials, sprays, blends, and supplies
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="products"
        className="relative overflow-hidden bg-[#171411] py-24 text-white"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff9b32]/60 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-[#ea7500]/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#ea7500]/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <Eyebrow className="text-[#ff9b32]">Featured products</Eyebrow>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Highlights from the{" "}
                <span className="font-display text-[1.1em] font-normal italic tracking-tight text-[#ffb866]">
                  research lineup.
                </span>
              </h2>
            </div>
            <div className="flex max-w-xl flex-col gap-4">
              <p className="leading-7 text-white/65">
                A curated rotation of core molecules, signature blends, and
                research compounds — browse strengths, compare formats, and add
                to cart without leaving the homepage.
              </p>
              <Link
                href="/store"
                className="group inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition duration-300 hover:border-[#ff9b32]/50 hover:bg-white/15"
              >
                View full store
                <ArrowIcon />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <FeaturedProductsSlideshow
              groups={featuredProductGroups}
              inventoryByProduct={inventoryByProduct}
              pricingTier={pricingTier}
            />
          </Reveal>
        </div>
      </section>

      <section id="quality" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="group rounded-4xl border border-black/5 bg-white p-4 shadow-xl shadow-orange-950/10 transition duration-500 hover:shadow-2xl hover:shadow-orange-950/15">
              <div className="overflow-hidden rounded-3xl">
                <Image
                  src="/ecw-sprays.PNG"
                  alt="East Coast Wellness research sprays"
                  width={1024}
                  height={683}
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <Eyebrow>Quality posture</Eyebrow>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Premium presentation with a{" "}
                <span className="text-gradient-ember font-display text-[1.1em] font-normal italic tracking-tight">
                  compliance-first
                </span>{" "}
                foundation.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#62564c]">
                The storefront can support product documentation, batch-specific
                records, and fulfillment details without implying approved use,
                therapeutic effect, or suitability for consumption.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {standards.map((standard, index) => (
                <Reveal key={standard} delay={index * 90}>
                  <div className="group h-full rounded-2xl border border-black/10 bg-white p-5 font-semibold shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#ea7500]/40 hover:shadow-lg hover:shadow-orange-950/10">
                    <span className="mb-4 block h-2 w-10 rounded-full bg-[#ea7500] transition-all duration-500 group-hover:w-16" />
                    {standard}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="compliance"
        className="relative border-y border-black/10 bg-[#fff8ef] px-6 py-20"
      >
        <Reveal className="mx-auto max-w-5xl text-center">
          <Eyebrow center>Use notice</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Research-use products are not marketed as medicines, supplements, or
            consumer health products.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#62564c]">
            East Coast Wellness products shown here are intended for qualified
            laboratory research only. Product information is provided for
            identification and cataloging purposes and should not be interpreted
            as medical advice, dosing guidance, or a statement of safety or
            efficacy.
          </p>
        </Reveal>
      </section>

      <footer className="relative bg-[#0d0a08] px-6 py-12 text-white">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff9b32]/40 to-transparent"
          aria-hidden="true"
        />
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="w-fit rounded-2xl bg-white p-3">
            <Logo className="h-auto w-52" />
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/70">
              <Link href="/store" className="link-underline transition hover:text-white">
                Store
              </Link>
              <Link
                href="/orders/lookup"
                className="link-underline transition hover:text-white"
              >
                Order Lookup
              </Link>
              <Link href="/login" className="link-underline transition hover:text-white">
                Login
              </Link>
            </nav>
            <div className="max-w-2xl text-sm leading-6 text-white/55 md:text-right">
              For research use only. Not for human or animal consumption. Not
              intended to diagnose, treat, cure, or prevent any disease.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
