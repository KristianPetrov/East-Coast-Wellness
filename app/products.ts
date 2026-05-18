export type Product = {
  id: string;
  name: string;
  amount: string;
  category: string;
  price: number;
  image: string;
};

export type ProductGroup = {
  id: string;
  name: string;
  category: string;
  variants: Product[];
};

function variantSortKey(amount: string) {
  const match = amount.match(/[\d,]+/);
  return match ? Number.parseFloat(match[0].replace(/,/g, "")) : 0;
}

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function groupProducts(items: Product[]): ProductGroup[] {
  const grouped = new Map<string, Product[]>();

  for (const product of items) {
    const existing = grouped.get(product.name) ?? [];
    existing.push(product);
    grouped.set(product.name, existing);
  }

  return Array.from(grouped.entries())
    .map(([name, variants]) => ({
      id: slugifyName(name),
      name,
      category: variants[0].category,
      variants: [...variants].sort(
        (a, b) => variantSortKey(a.amount) - variantSortKey(b.amount),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const products: Product[] = [
  {
    id: "aicar-50mg",
    name: "AICAR",
    amount: "50mg",
    category: "Research molecule",
    price: 99,
    image: "/product/aicar-50mg.png",
  },
  {
    id: "aod-9604-10mg",
    name: "AOD-9604",
    amount: "10mg",
    category: "Research molecule",
    price: 89,
    image: "/product/aod-9604-10mg.png",
  },
  {
    id: "bpc-157-10mg",
    name: "BPC-157",
    amount: "10mg",
    category: "Research molecule",
    price: 89,
    image: "/product/bpc-157-10mg.png",
  },
  {
    id: "cjc-ipamorelin-10mg-10mg",
    name: "CJC-1295 / Ipamorelin",
    amount: "10mg / 10mg",
    category: "Research blend",
    price: 129,
    image: "/product/cjc-1295-10mg-ipamorelin-10mg.png",
  },
  {
    id: "dihexa-10mg",
    name: "Dihexa",
    amount: "10mg",
    category: "Research molecule",
    price: 119,
    image: "/product/dihexa-10mg.png",
  },
  {
    id: "epitalon-10mg",
    name: "Epitalon",
    amount: "10mg",
    category: "Research molecule",
    price: 79,
    image: "/product/epitalon-10mg.png",
  },
  {
    id: "ghk-cu-50mg",
    name: "GHK-Cu",
    amount: "50mg",
    category: "Research molecule",
    price: 109,
    image: "/product/ghk-cu-50mg.png",
  },
  {
    id: "glow-blend",
    name: "GLOW",
    amount: "BPC-157 10mg / GHK-Cu 50mg / TB-500 10mg",
    category: "Research blend",
    price: 179,
    image: "/product/glow-10mg-50mg-10mg.png",
  },
  {
    id: "ipamorelin-10mg",
    name: "Ipamorelin",
    amount: "10mg",
    category: "Research molecule",
    price: 89,
    image: "/product/ipamorelin-10mg.png",
  },
  {
    id: "klow-blend",
    name: "KLOW",
    amount: "BPC-157 10mg / GHK-Cu 50mg / KPV 10mg / TB-500 10mg",
    category: "Research blend",
    price: 199,
    image: "/product/klow-10mg-50mg-10mg-10mg.png",
  },
  {
    id: "kpv-10mg",
    name: "KPV",
    amount: "10mg",
    category: "Research molecule",
    price: 79,
    image: "/product/kpv-10mg.png",
  },
  {
    id: "mt-2-10mg",
    name: "MT-2",
    amount: "10mg",
    category: "Research molecule",
    price: 79,
    image: "/product/mt-2-10mg.png",
  },
  {
    id: "mots-c-10mg",
    name: "MOTS-c",
    amount: "10mg",
    category: "Research molecule",
    price: 89,
    image: "/product/mots-c-10mg.png",
  },
  {
    id: "mots-c-40mg",
    name: "MOTS-c",
    amount: "40mg",
    category: "Research molecule",
    price: 229,
    image: "/product/mots-c-40mg.png",
  },
  {
    id: "nad-1000mg",
    name: "NAD+",
    amount: "1,000mg",
    category: "Research compound",
    price: 149,
    image: "/product/nad-1000mg.png",
  },
  {
    id: "pt-141-10mg",
    name: "PT-141",
    amount: "10mg",
    category: "Research molecule",
    price: 89,
    image: "/product/pt-141-10mg.png",
  },
  {
    id: "rt-3-10mg",
    name: "RT-3",
    amount: "10mg",
    category: "Research molecule",
    price: 79,
    image: "/product/rt-3-10mg.png",
  },
  {
    id: "rt-3-20mg",
    name: "RT-3",
    amount: "20mg",
    category: "Research molecule",
    price: 99,
    image: "/product/rt-3-20mg.png",
  },
  {
    id: "rt-3-30mg",
    name: "RT-3",
    amount: "30mg",
    category: "Research molecule",
    price: 119,
    image: "/product/rt-3-30mg.png",
  },
  {
    id: "rt-3-50mg",
    name: "RT-3",
    amount: "50mg",
    category: "Research molecule",
    price: 149,
    image: "/product/rt-3-50mg.png",
  },
  {
    id: "selank-10mg",
    name: "Selank",
    amount: "10mg",
    category: "Research molecule",
    price: 79,
    image: "/product/selank-10mg.png",
  },
  {
    id: "semax-10mg",
    name: "Semax",
    amount: "10mg",
    category: "Research molecule",
    price: 79,
    image: "/product/semax-10mg.png",
  },
  {
    id: "ss-31-10mg",
    name: "SS-31",
    amount: "10mg",
    category: "Research molecule",
    price: 99,
    image: "/product/ss-31-10mg.png",
  },
  {
    id: "tb-500-10mg",
    name: "TB-500",
    amount: "10mg",
    category: "Research molecule",
    price: 99,
    image: "/product/tb-500-10mg.png",
  },
  {
    id: "tesamorelin-10mg",
    name: "Tesamorelin",
    amount: "10mg",
    category: "Research molecule",
    price: 119,
    image: "/product/tesamorelin-10mg.png",
  },
  {
    id: "trz-2-10mg",
    name: "TRZ-2",
    amount: "10mg",
    category: "Research molecule",
    price: 79,
    image: "/product/trz-2-10mg.png",
  },
  {
    id: "trz-2-20mg",
    name: "TRZ-2",
    amount: "20mg",
    category: "Research molecule",
    price: 99,
    image: "/product/trz-2-20mg.png",
  },
  {
    id: "trz-2-30mg",
    name: "TRZ-2",
    amount: "30mg",
    category: "Research molecule",
    price: 119,
    image: "/product/trz-2-30mg.png",
  },
  {
    id: "wolverine-pro",
    name: "Wolverine Pro",
    amount: "BPC-157 10mg / TB-500 10mg",
    category: "Research blend",
    price: 159,
    image: "/product/wolverine-pro-10mg.png",
  },
  {
    id: "reconstitution-10ml",
    name: "Reconstitution Solution",
    amount: "10mL",
    category: "Research supply",
    price: 19,
    image: "/product/reconstitution-10ml.png",
  },
  {
    id: "reconstitution-30ml",
    name: "Reconstitution Solution",
    amount: "30mL",
    category: "Research supply",
    price: 39,
    image: "/product/reconstitution-30ml.png",
  },
];

export const productGroups = groupProducts(products);

const featuredProductNames = [
  "BPC-157",
  "NAD+",
  "Wolverine Pro",
  "GLOW",
  "CJC-1295 / Ipamorelin",
  "TB-500",
  "MOTS-c",
  "Tesamorelin",
];

export const featuredProductGroups = featuredProductNames
  .map((name) => productGroups.find((group) => group.name === name))
  .filter((group): group is ProductGroup => group !== undefined);

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
