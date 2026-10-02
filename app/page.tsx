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
    image: "/product/bpc-157-10mg.png",
  },
  {
    label: "Blends",
    category: "blend",
    body: "Signature multi-molecule research blends.",
    image: "/product/glow-10mg-50mg-10mg.png",
  },
  {
    label: "Compounds",
    category: "compound",
    body: "Specialty research compounds.",
    image: "/product/nad-1000mg.png",
  },
  {
    label: "Supplies",
    category: "supply",
    body: "Reconstitution solutions and lab supplies.",
    image: "/product/reconstitution-10ml.png",
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
        <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-5 pb-16 pt-28 sm:px-6 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-36">
          <div>
            <p
              className="animate-rise mb-7 flex w-fit items-center gap-3 rounded-full border border-copper/25 bg-bone/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-copper-deep backdrop-blur"
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
              className="animate-rise mt-7 max-w-xl text-lg leading-8 text-ink-soft"
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
            <p
              className="animate-rise mt-6 flex items-center gap-2.5 text-sm font-medium text-muted"
              style={{ "--delay": "540ms" } as React.CSSProperties}
            >
              <span className="h-px w-6 bg-copper/60" aria-hidden />
              For laboratory research use only.
            </p>
          </div>

          <div
            className="animate-scale-in relative mx-auto w-full max-w-xl lg:max-w-none"
            style={{ "--delay": "300ms" } as React.CSSProperties}
          >
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-copper/10 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_50px_100px_-40px_rgba(60,35,10,0.55)] ring-1 ring-ink/5">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-copper/15"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-copper/10"
                aria-hidden
              />
              <div className="relative flex items-end justify-center gap-2 px-6 pb-4 pt-12 sm:gap-4 sm:px-10 sm:pt-16">
                <Image
                  src="/product/bpc-157-10mg.png"
                  alt="BPC-157 research vial"
                  width={500}
                  height={900}
                  priority
                  className="float-slow mb-2 h-auto w-[27%] mix-blend-multiply [filter:brightness(1.07)]"
                />
                <Image
                  src="/product/glow-10mg-50mg-10mg.png"
                  alt="GLOW research blend vial"
                  width={500}
                  height={900}
                  priority
                  className="relative z-10 h-auto w-[36%] mix-blend-multiply [filter:brightness(1.07)]"
                />
                <Image
                  src="/product/nad-1000mg.png"
                  alt="NAD+ research vial"
                  width={500}
                  height={900}
                  priority
                  className="float-slow mb-2 h-auto w-[27%] mix-blend-multiply [filter:brightness(1.07)]"
                  style={{ animationDelay: "-3s" }}
                />
              </div>
              <div className="relative flex items-center justify-between gap-4 border-t border-copper/15 bg-white/60 px-6 py-4 backdrop-blur sm:px-8">
                <p className="font-display text-lg sm:text-xl">
                  Vials, sprays, blends, and supplies
                </p>
                <Link
                  href="/store"
                  aria-label="Shop the catalog"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-bone transition hover:bg-copper"
                >
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="products"
        className="relative overflow-hidden bg-night py-20 text-white sm:py-24"
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

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
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
                className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl border border-ink/10 bg-bone transition duration-500 hover:-translate-y-1 hover:border-copper/40 hover:shadow-[0_30px_60px_-35px_rgba(60,35,10,0.45)]"
              >
                <div className="absolute inset-x-0 top-0 flex h-[62%] items-center justify-center bg-white">
                  <Image
                    src={category.image}
                    alt=""
                    width={300}
                    height={540}
                    className="h-[88%] w-auto object-contain mix-blend-multiply [filter:brightness(1.07)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </div>
                <div className="relative bg-bone p-6 pt-5">
                  <span className="flex items-center justify-between font-display text-3xl">
                    {category.label}
                    <ArrowIcon className="h-5 w-5 text-copper" />
                  </span>
                  <span className="mt-1.5 block min-h-12 text-sm leading-6 text-muted">
                    {category.body}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="quality" className="border-y border-ink/8 bg-bone">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
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

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
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
