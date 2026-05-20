import type { Metadata } from "next";
import { getCurrentPricingTier } from "@/lib/member-pricing";
import { CheckoutPage } from "./CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | East Coast Wellness",
  description: "Enter checkout and shipping details for East Coast Wellness.",
};

export default async function Page() {
  const pricingTier = await getCurrentPricingTier();

  return <CheckoutPage pricingTier={pricingTier} />;
}
