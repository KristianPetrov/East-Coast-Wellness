import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getCurrentPricingTier } from "@/lib/member-pricing";
import { FloatingCart } from "./FloatingCart";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "East Coast Wellness | Research Molecule Store",
  description:
    "Premium research-use molecule catalog and storefront for East Coast Wellness.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pricingTier = await getCurrentPricingTier();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <FloatingCart pricingTier={pricingTier} />
      </body>
    </html>
  );
}
