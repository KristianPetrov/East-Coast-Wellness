import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getInventoryByProductId } from "@/lib/inventory";
import { getCurrentPricingTier } from "@/lib/member-pricing";
import { getProductsWithPrices } from "@/lib/pricing";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { FeaturedProductsSlideshow } from "./FeaturedProductsSlideshow";
import { getFeaturedProductGroups, groupProducts } from "./products";
import { Reveal } from "./Reveal";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { ArrowIcon, btnGhost, btnPrimary, Eyebrow } from "./ui";

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
  {
    title: "Research-use-only labeling",
    body: "Every vial, spray, and kit is clearly labeled for laboratory research use.",
  },
  {
    title: "Batch documentation available",
    body: "Batch-specific records can be provided to support your documentation.",
  },
  {
    title: "Temperature-conscious fulfillment",
    body: "Orders are packed with attention to temperature-sensitive materials.",
  },
  {
    title: "Responsive client support",
    body: "Questions about orders, payment, and shipping get a prompt reply.",
  },
];

const categoryLinks = [
  {
    label: "Molecules",
    category: "molecule",
    body: "Single research molecules in vial and kit formats.",
  },
  {
    label: "Blends",
    category: "blend",
    body: "Signature multi-molecule research blends.",
  },
  {
    label: "Compounds",
    category: "compound",
    body: "Specialty research compounds.",
  },
  {
    label: "Supplies",
    category: "supply",
    body: "Reconstitution solutions and lab supplies.",
  },
];

const steps = [
  {
    title: "Build your order",
    body: "Choose strengths and vial or 10-vial kit formats, then review your cart.",
  },
  {
    title: "Create the order",
    body: "Enter shipping details at checkout. Referral codes apply automatically.",
  },
  {
    title: "Pay and track",
    body: "Pay by Venmo or Zelle, then follow payment and tracking status online.",
  },
];

export default async function Home() {
  const [inventoryByProduct, pricingTier, catalog] = await Promise.all([
    getInventoryByProductId(),
    getCurrentPricingTier(),
    getProductsWithPrices(),
  ]);
  const allGroups = groupProducts(catalog);
  const featuredProductGroups = getFeaturedProductGroups(allGroups);
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
    <main className="flex min-h-screen flex-col overflow-x-clip bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader overlay />

      <section className="grain relative border-b border-ink/8 bg-[radial-gradient(ellipse_at_85%_10%,rgba(212,138,69,0.16),transparent_45%),linear-gradient(180deg,#fbf8f3_0%,#f1e9dd_100%)]">
        <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-32 sm:px-6 sm:pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-44">
          <div>
            <p
              className="animate-rise mb-7 flex w-fit items-center gap-3 rounded-full border border-copper/25 bg-bone/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-copper-deep backdrop-blur"
              style={{ "--delay": "100ms" } as React.CSSProperties}
            >
              <span className="status-dot relative h-1.5 w-1.5 rounded-full bg-copper" aria-hidden="true" />
              Premium research supply
            </p>
            <h1
              className="animate-rise max-w-3xl font-display text-[3.4rem] leading-[0.98] tracking-tight text-ink sm:text-7xl lg:text-[5.6rem]"
              style={{ "--delay": "200ms" } as React.CSSProperties}
            >
              Precision molecules,{" "}
              <span className="text-gradient-copper italic">presented with care.</span>
            </h1>
            <p
              className="animate-rise mt-7 max-w-xl text-lg leading-8 text-muted"
              style={{ "--delay": "320ms" } as React.CSSProperties}
            >
              A refined catalog of research-use molecules, blends, sprays, and
              reconstitution solutions, with clear documentation and compliant
              product presentation.
            </p>
            <div
              className="animate-rise mt-9 flex flex-col gap-3 sm:flex-row"
              style={{ "--delay": "440ms" } as React.CSSProperties}
            >
              <Link href="/store" className={`group ${btnPrimary} px-7! py-4!`}>
                Shop the catalog
                <ArrowIcon />
              </Link>
              <a href="#compliance" className={`${btnGhost} px-7! py-4!`}>
                Read the use notice
              </a>
            </div>
            <dl
              className="animate-rise mt-12 grid max-w-lg grid-cols-3 divide-x divide-ink/10 border-y border-ink/10 py-5"
              style={{ "--delay": "560ms" } as React.CSSProperties}
            >
              <div className="pr-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-faint">
                  Catalog
                </dt>
                <dd className="mt-1 font-display text-2xl sm:text-3xl">{allGroups.length}+</dd>
              </div>
              <div className="px-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-faint">
                  Formats
                </dt>
                <dd className="mt-1 font-display text-2xl sm:text-3xl">Vial · Kit</dd>
              </div>
              <div className="pl-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-faint">
                  Checkout
                </dt>
                <dd className="mt-1 font-display text-2xl sm:text-3xl">Guest</dd>
              </div>
            </dl>
          </div>

          <div
            className="animate-scale-in relative"
            style={{ "--delay": "300ms" } as React.CSSProperties}
          >
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-copper/10 blur-3xl" aria-hidden />
            <div className="float-slow relative rounded-[1.75rem] border border-white bg-white p-3 shadow-[0_50px_100px_-40px_rgba(60,35,10,0.55)] ring-1 ring-ink/5">
              <div className="overflow-hidden rounded-[1.25rem]">
                <Image
                  src="/ecw-reconsitution-vials.PNG"
                  alt="East Coast Wellness reconstitution solution vials"
                  width={1774}
                  height={887}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex items-center justify-between gap-4 px-3 pb-2 pt-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-copper">
                    The research catalog
                  </p>
                  <p className="mt-1 font-display text-xl sm:text-2xl">
                    Vials, sprays, blends, and supplies
                  </p>
                </div>
                <Link
                  href="/store"
                  aria-label="Shop the catalog"
                  className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-bone transition hover:bg-copper"
                >
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Our standards" className="border-b border-ink/8 bg-bone">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-ink/8 lg:grid-cols-4">
          {standards.map((standard, index) => (
            <div key={standard.title} className="flex items-center gap-3 bg-bone px-5 py-5 sm:px-6">
              <span className="font-display text-lg italic text-copper">
                0{index + 1}
              </span>
              <span className="text-[13px] font-medium leading-snug text-ink-soft">
                {standard.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        id="products"
        className="relative overflow-hidden bg-night py-24 text-white sm:py-28"
      >
        <div className="rule-copper absolute inset-x-0 top-0 h-px" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-copper/15 blur-[120px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <Eyebrow className="text-copper-bright">Featured products</Eyebrow>
              <h2 className="mt-5 max-w-2xl font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
                Highlights from the{" "}
                <span className="italic text-copper-bright">research lineup.</span>
              </h2>
            </div>
            <div className="flex max-w-md flex-col gap-5">
              <p className="leading-7 text-white/60">
                Core molecules, signature blends, and research compounds.
                Compare strengths and formats, then add to cart right here.
              </p>
              <Link
                href="/store"
                className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-white transition hover:text-copper-bright"
              >
                <span className="link-underline">View the full catalog</span>
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

      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-6 sm:py-28 lg:px-8">
        <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Shop by category</Eyebrow>
            <h2 className="mt-5 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              Find what your work <span className="italic text-copper">calls for.</span>
            </h2>
          </div>
          <Link
            href="/store"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-copper"
          >
            <span className="link-underline">All products</span>
            <ArrowIcon />
          </Link>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryLinks.map((category, index) => (
            <Reveal key={category.category} delay={index * 80}>
              <Link
                href={`/store?category=${category.category}`}
                className="group flex h-full flex-col justify-between gap-10 rounded-2xl border border-ink/10 bg-bone p-6 transition duration-500 hover:-translate-y-1 hover:border-copper/40 hover:bg-white hover:shadow-[0_30px_60px_-35px_rgba(60,35,10,0.45)]"
              >
                <span className="font-display text-lg italic text-copper">
                  0{index + 1}
                </span>
                <span>
                  <span className="flex items-center justify-between font-display text-3xl">
                    {category.label}
                    <ArrowIcon className="h-5 w-5 text-copper" />
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-muted">
                    {category.body}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="quality" className="border-y border-ink/8 bg-bone">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center lg:px-8">
          <Reveal>
            <div className="group overflow-hidden rounded-[1.75rem] border border-white bg-white p-3 shadow-[0_50px_100px_-50px_rgba(60,35,10,0.5)]">
              <div className="overflow-hidden rounded-[1.25rem]">
                <Image
                  src="/ecw-sprays.PNG"
                  alt="East Coast Wellness research sprays"
                  width={1536}
                  height={1024}
                  className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <Eyebrow>Our standards</Eyebrow>
              <h2 className="mt-5 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
                Premium presentation on a{" "}
                <span className="text-gradient-copper italic">compliance-first</span>{" "}
                foundation.
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted">
                The catalog supports product documentation, batch-specific
                records, and fulfillment details without implying approved use,
                therapeutic effect, or suitability for consumption.
              </p>
            </Reveal>
            <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
              {standards.map((standard, index) => (
                <Reveal key={standard.title} delay={index * 80}>
                  <div className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-5">
                    <span className="font-display text-xl italic text-copper">
                      0{index + 1}
                    </span>
                    <div>
                      <dt className="font-medium text-ink">{standard.title}</dt>
                      <dd className="mt-1 text-sm leading-6 text-muted">{standard.body}</dd>
                    </div>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-6 sm:py-28 lg:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>How ordering works</Eyebrow>
          <h2 className="mt-5 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Three steps, <span className="italic text-copper">no surprises.</span>
          </h2>
        </Reveal>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 100}>
              <div className="h-full rounded-2xl border border-ink/10 bg-white/70 p-7">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-copper/30 font-display text-lg text-copper">
                  {index + 1}
                </span>
                <h3 className="mt-8 font-display text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
          <span>Already ordered?</span>
          <Link
            href="/orders/lookup"
            className="group inline-flex items-center gap-2 font-medium text-ink transition hover:text-copper"
          >
            <span className="link-underline">Track your order</span>
            <ArrowIcon />
          </Link>
        </Reveal>
      </section>

      <section id="compliance" className="relative bg-sand/60 px-5 py-24 sm:px-6">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow center>Use notice</Eyebrow>
          <h2 className="mt-6 font-display text-3xl leading-snug tracking-tight sm:text-[2.6rem]">
            Research-use products are not marketed as medicines, supplements,
            or consumer health products.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl leading-8 text-muted">
            East Coast Wellness products shown here are intended for qualified
            laboratory research only. Product information is provided for
            identification and cataloging purposes and should not be interpreted
            as medical advice, dosing guidance, or a statement of safety or
            efficacy.
          </p>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
