import { db } from "@/db";
import { productInventory } from "@/db/schema";

export type InventoryByProductId = Record<string, number>;

export async function getInventoryByProductId(): Promise<InventoryByProductId> {
  const rows = await db.select().from(productInventory);

  return Object.fromEntries(rows.map((row) => [row.productId, row.quantity]));
}
