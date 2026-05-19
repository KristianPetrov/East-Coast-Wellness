import type { Metadata } from "next";
import { getInventoryByProductId } from "@/lib/inventory";
import { StorePage } from "./StorePage";

export const metadata: Metadata = {
  title: "Store | East Coast Wellness",
  description: "Search East Coast Wellness research-use molecule products.",
};

export default async function Page() {
  const inventoryByProduct = await getInventoryByProductId();

  return <StorePage inventoryByProduct={inventoryByProduct} />;
}
