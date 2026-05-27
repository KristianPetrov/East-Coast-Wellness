import type { Metadata } from "next";
import { getInventoryByProductId } from "@/lib/inventory";
import { getCurrentPricingTier } from "@/lib/member-pricing";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { productGroups } from "../products";
import { StorePage } from "./StorePage";

export const metadata: Metadata = {
  title: "Research Store",
  description:
    "Browse East Coast Wellness research-use molecules, blends, sprays, and reconstitution supplies with compliant catalog details.",
  alternates: {
    canonical: "/store",
  },
  openGraph: {
    url: "/store",
    title: `Research Store | ${siteConfig.name}`,
    description:
      "Browse research-use molecules, blends, sprays, and reconstitution supplies from East Coast Wellness.",
  },
  twitter: {
    title: `Research Store | ${siteConfig.name}`,
    description:
      "Browse research-use molecules, blends, sprays, and reconstitution supplies from East Coast Wellness.",
  },
};

export default async function Page() {
  const [inventoryByProduct, pricingTier] = await Promise.all([
    getInventoryByProductId(),
    getCurrentPricingTier(),
  ]);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteConfig.name} research catalog`,
    url: absoluteUrl("/store"),
    itemListElement: productGroups.map((group, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: group.name,
        category: group.category,
        url: absoluteUrl("/store"),
        image: absoluteUrl(group.variants[0].image),
        description: `${group.name} ${group.category.toLowerCase()} for laboratory research use only.`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <StorePage
        inventoryByProduct={inventoryByProduct}
        pricingTier={pricingTier}
      />
    </>
  );
}
