import type { Metadata } from "next";
import { CheckoutPage } from "./CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | East Coast Wellness",
  description: "Enter checkout and shipping details for East Coast Wellness.",
};

export default function Page() {
  return <CheckoutPage />;
}
