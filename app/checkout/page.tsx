import type { Metadata } from "next";
import { getCurrentPricingTier } from "@/lib/member-pricing";
import { getProductsWithPrices } from "@/lib/pricing";
import { CheckoutPage } from "./CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | East Coast Wellness",
  description: "Enter checkout and shipping details for East Coast Wellness.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  const [pricingTier, catalog] = await Promise.all([
    getCurrentPricingTier(),
    getProductsWithPrices(),
  ]);

  return <CheckoutPage pricingTier={pricingTier} catalog={catalog} />;
}
