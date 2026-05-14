import Image from "next/image";

const featuredProducts = [
  {
    name: "BPC-157",
    amount: "10mg",
    category: "Research peptide",
    price: "$89",
  },
  {
    name: "CJC-1295 / Ipamorelin",
    amount: "10mg / 10mg",
    category: "Research blend",
    price: "$129",
  },
  {
    name: "NAD+",
    amount: "1,000mg",
    category: "Research compound",
    price: "$149",
  },
  {
    name: "Tesamorelin",
    amount: "20mg",
    category: "Research peptide",
    price: "$169",
  },
  {
    name: "Selank",
    amount: "10mg",
    category: "Research peptide",
    price: "$79",
  },
  {
    name: "Semax",
    amount: "10mg",
    category: "Research peptide",
    price: "$79",
  },
];

const catalogSections = [
  {
    title: "A-K Collection",
    image: "/ecw-a-k.PNG",
    alt: "East Coast Wellness research vials from A through K",
  },
  {
    title: "L-R Collection",
    image: "/ecw-l-r.PNG",
    alt: "East Coast Wellness research vials from L through R",
  },
  {
    title: "S-Z Collection",
    image: "/ecw-s-z.PNG",
    alt: "East Coast Wellness research vials from S through Z",
  },
];

const standards = [
  "Research-use-only labeling",
  "Batch documentation available",
  "Temperature-conscious fulfillment",
  "Responsive client support",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f2ea] text-[#171411]">
      <section className="relative border-b border-black/10 bg-[radial-gradient(circle_at_top_right,rgba(234,117,0,0.18),transparent_32%),linear-gradient(135deg,#fffaf2_0%,#efe4d6_100%)]">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Image
            src="/ecw-logo-horizontal.PNG"
            alt="East Coast Wellness"
            width={832}
            height={225}
            className="h-auto w-48 sm:w-64"
            priority
          />
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#5f544a] md:flex">
            <a href="#catalog" className="transition hover:text-[#171411]">
              Catalog
            </a>
            <a href="#quality" className="transition hover:text-[#171411]">
              Quality
            </a>
            <a href="#compliance" className="transition hover:text-[#171411]">
              Compliance
            </a>
          </nav>
          <a
            href="#catalog"
            className="rounded-full bg-[#ea7500] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:bg-[#c95f00]"
          >
            Shop Research
          </a>
        </header>

        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-28 lg:pt-16">
          <div className="flex flex-col justify-center">
            <p className="mb-5 w-fit rounded-full border border-[#ea7500]/30 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#a24b00]">
              Premium research supply
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tighter text-[#171411] sm:text-6xl lg:text-7xl">
              Precision peptide catalog for qualified research.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f544a]">
              East Coast Wellness offers a refined shopping experience for
              research-use peptides, blends, sprays, and reconstitution
              solutions with clear documentation and compliant product
              presentation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#products"
                className="rounded-full bg-[#171411] px-7 py-4 text-center text-sm font-bold text-white transition hover:bg-[#302821]"
              >
                Browse Featured Products
              </a>
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

      <section id="catalog" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#c95f00]">
              Organized catalog
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Built to feel premium from search to checkout.
            </h2>
          </div>
          <p className="text-lg leading-8 text-[#62564c]">
            Browse the core East Coast Wellness research lineup by alphabetized
            collections, with product language focused on identity, format,
            amount, and research-use status.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {catalogSections.map((section) => (
            <article
              key={section.title}
              className="group overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-950/10"
            >
              <Image
                src={section.image}
                alt={section.alt}
                width={1024}
                height={512}
                className="aspect-[1.45] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="flex items-center justify-between p-6">
                <div>
                  <h3 className="text-xl font-semibold">{section.title}</h3>
                  <p className="mt-1 text-sm text-[#74675d]">
                    View available research products
                  </p>
                </div>
                <span className="rounded-full bg-[#fff2e4] px-4 py-2 text-sm font-bold text-[#bf5700]">
                  Shop
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="products" className="bg-[#171411] py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#ff9b32]">
                Featured products
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Research products, presented clearly.
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-white/65">
              Product cards avoid wellness outcomes and medical claims while
              keeping the shopping experience direct, polished, and easy to
              scan.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <article
                key={product.name}
                className="rounded-3xl border border-white/10 bg-white/6 p-6 shadow-xl shadow-black/20 transition hover:border-[#ea7500]/60 hover:bg-white/9"
              >
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff9b32]">
                      {product.category}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-white/55">{product.amount}</p>
                  </div>
                  <p className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#171411]">
                    {product.price}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-sm text-white/55">
                    For research use only
                  </span>
                  <button className="rounded-full bg-[#ea7500] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ff8a16]">
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
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
            <Image
              src="/ecw-logo-horizontal.PNG"
              alt="East Coast Wellness"
              width={832}
              height={225}
              className="h-auto w-52"
            />
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
