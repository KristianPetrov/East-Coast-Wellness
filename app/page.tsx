import Image from "next/image";
import Link from "next/link";
import { getInventoryByProductId } from "@/lib/inventory";
import { FeaturedProductsSlideshow } from "./FeaturedProductsSlideshow";
import { Logo } from "./Logo";
import { featuredProductGroups } from "./products";

const standards = [
  "Research-use-only labeling",
  "Batch documentation available",
  "Temperature-conscious fulfillment",
  "Responsive client support",
];

export default async function Home() {
  const inventoryByProduct = await getInventoryByProductId();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f2ea] text-[#171411]">
      <section className="relative border-b border-black/10 bg-[radial-gradient(circle_at_top_right,rgba(234,117,0,0.18),transparent_32%),linear-gradient(135deg,#fffaf2_0%,#efe4d6_100%)]">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Logo priority />
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#5f544a] md:flex">
            <a href="#products" className="transition hover:text-[#171411]">
              Featured
            </a>
            <a href="#quality" className="transition hover:text-[#171411]">
              Quality
            </a>
            <a href="#compliance" className="transition hover:text-[#171411]">
              Compliance
            </a>
            <Link href="/orders/lookup" className="transition hover:text-[#171411]">
              Order Lookup
            </Link>
          </nav>
          <Link
            href="/store"
            className="rounded-full bg-[#ea7500] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:bg-[#c95f00]"
          >
            Shop Research
          </Link>
        </header>

        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-28 lg:pt-16">
          <div className="flex flex-col justify-center">
            <p className="mb-5 w-fit rounded-full border border-[#ea7500]/30 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#a24b00]">
              Premium research supply
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tighter text-[#171411] sm:text-6xl lg:text-7xl">
              Precision molecule catalog for qualified research.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f544a]">
              East Coast Wellness offers a refined shopping experience for
              research-use molecules, blends, sprays, and reconstitution
              solutions with clear documentation and compliant product
              presentation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/store"
                className="rounded-full bg-[#171411] px-7 py-4 text-center text-sm font-bold text-white transition hover:bg-[#302821]"
              >
                Browse Store
              </Link>
              <a
                href="#compliance"
                className="rounded-full border border-black/15 bg-white/50 px-7 py-4 text-center text-sm font-bold text-[#171411] transition hover:bg-white"
              >
                Read Use Notice
              </a>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-6 text-[#786b60]">
              Products displayed on this site are intended for laboratory
              research only. They are not offered for human or animal
              consumption, diagnosis, treatment, cure, or prevention of disease.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-16 hidden h-28 w-28 rounded-full bg-[#ea7500]/25 blur-3xl lg:block" />
            <div className="relative rounded-4xl border border-white/20 bg-white/90 p-4 shadow-2xl shadow-black/30">
              <Image
                src="/ecw-reconsitution-vials.PNG"
                alt="East Coast Wellness reconstitution solution vials"
                width={1024}
                height={512}
                className="rounded-[1.45rem] object-cover"
                priority
              />
              <div className="absolute bottom-7 left-7 right-7 rounded-3xl border border-white/30 bg-black/70 p-5 text-white backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#ffac4a]">
                  Research catalog
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  Vials, sprays, blends, and supplies
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="bg-[#171411] py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#ff9b32]">
                Featured products
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Highlights from the research lineup.
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
                className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:border-[#ff9b32]/50 hover:bg-white/15"
              >
                View full store
              </Link>
            </div>
          </div>

          <FeaturedProductsSlideshow
            groups={featuredProductGroups}
            inventoryByProduct={inventoryByProduct}
          />
        </div>
      </section>

      <section id="quality" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="rounded-4xl bg-white p-4 shadow-xl shadow-orange-950/10">
            <Image
              src="/ecw-sprays.PNG"
              alt="East Coast Wellness research sprays"
              width={1024}
              height={683}
              className="rounded-3xl object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#c95f00]">
              Quality posture
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Premium presentation with a compliance-first foundation.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#62564c]">
              The storefront can support product documentation, batch-specific
              records, and fulfillment details without implying approved use,
              therapeutic effect, or suitability for consumption.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {standards.map((standard) => (
                <div
                  key={standard}
                  className="rounded-2xl border border-black/10 bg-white p-5 font-semibold shadow-sm"
                >
                  <span className="mb-4 block h-2 w-10 rounded-full bg-[#ea7500]" />
                  {standard}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="compliance"
        className="border-y border-black/10 bg-[#fff8ef] px-6 py-16"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#c95f00]">
            Use notice
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
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
        </div>
      </section>

      <footer className="bg-[#0d0a08] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="w-fit rounded-2xl bg-white p-3">
            <Logo className="h-auto w-52" />
          </div>
          <div className="max-w-2xl text-sm leading-6 text-white/55 md:text-right">
            For research use only. Not for human or animal consumption. Not
            intended to diagnose, treat, cure, or prevent any disease.
          </div>
        </div>
      </footer>
    </main>
  );
}
