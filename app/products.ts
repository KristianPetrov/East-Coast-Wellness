export type Product = {
  id: string;
  name: string;
  amount: string;
  category: string;
  retailVialPrice: number;
  memberVialPrice: number;
  retailKitPrice?: number;
  memberKitPrice?: number;
  image: string;
};

export type PricingTier = "retail" | "member";
export type ProductPackageType = "vial" | "kit";

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
    retailVialPrice: 60,
    memberVialPrice: 30,
    retailKitPrice: 480,
    memberKitPrice: 240,
    image: "/product/aicar-50mg.png",
  },
  {
    id: "aod-9604-10mg",
    name: "AOD-9604",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 120,
    memberVialPrice: 60,
    retailKitPrice: 960,
    memberKitPrice: 480,
    image: "/product/aod-9604-10mg.png",
  },
  {
    id: "bpc-157-10mg",
    name: "BPC-157",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 65,
    memberVialPrice: 30,
    retailKitPrice: 520,
    memberKitPrice: 240,
    image: "/product/bpc-157-10mg.png",
  },
  {
    id: "cjc-ipamorelin-5mg-5mg",
    name: "CJC-1295 No DAC / Ipamorelin",
    amount: "5mg / 5mg",
    category: "Research blend",
    retailVialPrice: 60,
    memberVialPrice: 30,
    retailKitPrice: 480,
    memberKitPrice: 240,
    image: "/product/cjc-1295-10mg-ipamorelin-10mg.png",
  },
  {
    id: "cjc-ipamorelin-10mg-10mg",
    name: "CJC-1295 No DAC / Ipamorelin",
    amount: "10mg / 10mg",
    category: "Research blend",
    retailVialPrice: 100,
    memberVialPrice: 50,
    retailKitPrice: 800,
    memberKitPrice: 400,
    image: "/product/cjc-1295-10mg-ipamorelin-10mg.png",
  },
  {
    id: "dihexa-10mg",
    name: "Dihexa",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 125,
    memberVialPrice: 30,
    retailKitPrice: 1000,
    memberKitPrice: 240,
    image: "/product/dihexa-10mg.png",
  },
  {
    id: "epitalon-10mg",
    name: "Epitalon",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 50,
    memberVialPrice: 25,
    retailKitPrice: 400,
    memberKitPrice: 200,
    image: "/product/epitalon-10mg.png",
  },
  {
    id: "ghk-cu-50mg",
    name: "GHK-Cu",
    amount: "50mg",
    category: "Research molecule",
    retailVialPrice: 65,
    memberVialPrice: 35,
    retailKitPrice: 520,
    memberKitPrice: 280,
    image: "/product/ghk-cu-50mg.png",
  },
  {
    id: "glow-blend",
    name: "GLOW",
    amount: "BPC-157 10mg / GHK-Cu 50mg / TB-500 10mg",
    category: "Research blend",
    retailVialPrice: 180,
    memberVialPrice: 80,
    retailKitPrice: 1440,
    memberKitPrice: 640,
    image: "/product/glow-10mg-50mg-10mg.png",
  },
  {
    id: "ipamorelin-10mg",
    name: "Ipamorelin",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 55,
    memberVialPrice: 35,
    retailKitPrice: 440,
    memberKitPrice: 280,
    image: "/product/ipamorelin-10mg.png",
  },
  {
    id: "klow-blend",
    name: "KLOW",
    amount: "BPC-157 10mg / GHK-Cu 50mg / KPV 10mg / TB-500 10mg",
    category: "Research blend",
    retailVialPrice: 195,
    memberVialPrice: 90,
    retailKitPrice: 1560,
    memberKitPrice: 720,
    image: "/product/klow-10mg-50mg-10mg-10mg.png",
  },
  {
    id: "kpv-10mg",
    name: "KPV",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 60,
    memberVialPrice: 30,
    retailKitPrice: 480,
    memberKitPrice: 240,
    image: "/product/kpv-10mg.png",
  },
  {
    id: "mt-2-10mg",
    name: "MT-2",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 45,
    memberVialPrice: 20,
    retailKitPrice: 360,
    memberKitPrice: 160,
    image: "/product/mt-2-10mg.png",
  },
  {
    id: "mots-c-10mg",
    name: "MOTS-c",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 65,
    memberVialPrice: 40,
    retailKitPrice: 520,
    memberKitPrice: 320,
    image: "/product/mots-c-10mg.png",
  },
  {
    id: "mots-c-40mg",
    name: "MOTS-c",
    amount: "40mg",
    category: "Research molecule",
    retailVialPrice: 130,
    memberVialPrice: 55,
    retailKitPrice: 1040,
    memberKitPrice: 440,
    image: "/product/mots-c-40mg.png",
  },
  {
    id: "nad-1000mg",
    name: "NAD+",
    amount: "1,000mg",
    category: "Research compound",
    retailVialPrice: 200,
    memberVialPrice: 65,
    retailKitPrice: 1600,
    memberKitPrice: 520,
    image: "/product/nad-1000mg.png",
  },
  {
    id: "pt-141-10mg",
    name: "PT-141",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 65,
    memberVialPrice: 30,
    retailKitPrice: 520,
    memberKitPrice: 240,
    image: "/product/pt-141-10mg.png",
  },
  {
    id: "rt-3-10mg",
    name: "RT-3",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 180,
    memberVialPrice: 65,
    retailKitPrice: 1440,
    memberKitPrice: 520,
    image: "/product/rt-3-10mg.png",
  },
  {
    id: "rt-3-20mg",
    name: "RT-3",
    amount: "20mg",
    category: "Research molecule",
    retailVialPrice: 350,
    memberVialPrice: 85,
    retailKitPrice: 2800,
    memberKitPrice: 680,
    image: "/product/rt-3-20mg.png",
  },
  {
    id: "rt-3-30mg",
    name: "RT-3",
    amount: "30mg",
    category: "Research molecule",
    retailVialPrice: 450,
    memberVialPrice: 95,
    retailKitPrice: 3600,
    memberKitPrice: 760,
    image: "/product/rt-3-30mg.png",
  },
  {
    id: "rt-3-50mg",
    name: "RT-3",
    amount: "50mg",
    category: "Research molecule",
    retailVialPrice: 550,
    memberVialPrice: 135,
    retailKitPrice: 4400,
    memberKitPrice: 1080,
    image: "/product/rt-3-50mg.png",
  },
  {
    id: "ss-31-10mg",
    name: "SS-31",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 75,
    memberVialPrice: 35,
    retailKitPrice: 600,
    memberKitPrice: 280,
    image: "/product/ss-31-10mg.png",
  },
  {
    id: "selank-10mg",
    name: "Selank",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 60,
    memberVialPrice: 35,
    retailKitPrice: 480,
    memberKitPrice: 280,
    image: "/product/selank-10mg.png",
  },
  {
    id: "semax-10mg",
    name: "Semax",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 60,
    memberVialPrice: 35,
    retailKitPrice: 480,
    memberKitPrice: 280,
    image: "/product/semax-10mg.png",
  },
  {
    id: "tb-500-10mg",
    name: "TB-500",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 60,
    memberVialPrice: 35,
    retailKitPrice: 480,
    memberKitPrice: 280,
    image: "/product/tb-500-10mg.png",
  },
  {
    id: "tesamorelin-10mg",
    name: "Tesamorelin",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 100,
    memberVialPrice: 60,
    retailKitPrice: 800,
    memberKitPrice: 480,
    image: "/product/tesamorelin-10mg.png",
  },
  {
    id: "tesamorelin-20mg",
    name: "Tesamorelin",
    amount: "20mg",
    category: "Research molecule",
    retailVialPrice: 140,
    memberVialPrice: 70,
    retailKitPrice: 1120,
    memberKitPrice: 560,
    image: "/product/tesamorelin-10mg.png",
  },
  {
    id: "trz-2-10mg",
    name: "TRZ-2",
    amount: "10mg",
    category: "Research molecule",
    retailVialPrice: 180,
    memberVialPrice: 60,
    retailKitPrice: 1440,
    memberKitPrice: 480,
    image: "/product/trz-2-10mg.png",
  },
  {
    id: "trz-2-20mg",
    name: "TRZ-2",
    amount: "20mg",
    category: "Research molecule",
    retailVialPrice: 300,
    memberVialPrice: 80,
    retailKitPrice: 2400,
    memberKitPrice: 640,
    image: "/product/trz-2-20mg.png",
  },
  {
    id: "trz-2-30mg",
    name: "TRZ-2",
    amount: "30mg",
    category: "Research molecule",
    retailVialPrice: 450,
    memberVialPrice: 100,
    retailKitPrice: 3600,
    memberKitPrice: 800,
    image: "/product/trz-2-30mg.png",
  },
  {
    id: "wolverine-pro",
    name: "Wolverine Pro",
    amount: "BPC-157 10mg / TB-500 10mg",
    category: "Research blend",
    retailVialPrice: 150,
    memberVialPrice: 65,
    retailKitPrice: 1200,
    memberKitPrice: 520,
    image: "/product/wolverine-pro-10mg.png",
  },
  {
    id: "reconstitution-3ml",
    name: "Reconstitution Solution",
    amount: "3mL",
    category: "Research supply",
    retailVialPrice: 10,
    memberVialPrice: 6,
    image: "/product/reconstitution-10ml.png",
  },
  {
    id: "reconstitution-10ml",
    name: "Reconstitution Solution",
    amount: "10mL",
    category: "Research supply",
    retailVialPrice: 20,
    memberVialPrice: 10,
    image: "/product/reconstitution-10ml.png",
  },
  {
    id: "reconstitution-30ml",
    name: "Reconstitution Solution",
    amount: "30mL",
    category: "Research supply",
    retailVialPrice: 45,
    memberVialPrice: 35,
    image: "/product/reconstitution-30ml.png",
  },
];

export const productGroups = groupProducts(products);

const featuredProductNames = [
  "BPC-157",
  "NAD+",
  "Wolverine Pro",
  "GLOW",
  "CJC-1295 No DAC / Ipamorelin",
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

export function hasKitPricing(product: Product) {
  return (
    product.retailKitPrice !== undefined && product.memberKitPrice !== undefined
  );
}

export function getProductPrice(
  product: Product,
  tier: PricingTier,
  packageType: ProductPackageType,
) {
  if (packageType === "kit" && hasKitPricing(product)) {
    return tier === "member" ? product.memberKitPrice! : product.retailKitPrice!;
  }

  return tier === "member" ? product.memberVialPrice : product.retailVialPrice;
}

export function getProductPackageSize(packageType: ProductPackageType) {
  return packageType === "kit" ? 10 : 1;
}

export function getProductPackageLabel(packageType: ProductPackageType) {
  return packageType === "kit" ? "Kit (10 vials)" : "Single vial";
}

export function getCartItemId(
  productId: string,
  packageType: ProductPackageType,
) {
  return `${productId}:${packageType}`;
}

export function parseCartItemId(cartItemId: string): {
  productId: string;
  packageType: ProductPackageType;
} {
  const [productId, packageType] = cartItemId.split(":");

  if (packageType === "kit" || packageType === "vial") {
    return { productId, packageType };
  }

  return { productId: cartItemId, packageType: "vial" };
}
