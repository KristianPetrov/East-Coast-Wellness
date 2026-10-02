import { cache } from "react";
import { db } from "@/db";
import { productPrices } from "@/db/schema";
import { hasKitPricing, products, type Product } from "@/app/products";

type PriceOverride = typeof productPrices.$inferSelect;

function applyPriceOverride(
  product: Product,
  override: PriceOverride | undefined,
): Product {
  if (!override) {
    return product;
  }

  const toDollars = (cents: number | null, fallback: number) =>
    cents === null ? fallback : cents / 100;

  return {
    ...product,
    retailVialPrice: toDollars(
      override.retailVialPriceCents,
      product.retailVialPrice,
    ),
    memberVialPrice: toDollars(
      override.memberVialPriceCents,
      product.memberVialPrice,
    ),
    // Only products that are sold as kits can have kit prices.
    ...(hasKitPricing(product)
      ? {
          retailKitPrice: toDollars(
            override.retailKitPriceCents,
            product.retailKitPrice!,
          ),
          memberKitPrice: toDollars(
            override.memberKitPriceCents,
            product.memberKitPrice!,
          ),
        }
      : {}),
  };
}

export async function getPriceOverrides() {
  return db.select().from(productPrices);
}

/**
 * The catalog with admin price overrides applied. This is the source of truth
 * for every price shown to customers and for what checkout charges.
 * Memoized per request so the layout and page can both call it.
 */
export const getProductsWithPrices = cache(async (): Promise<Product[]> => {
  const overrides = await getPriceOverrides();
  const overrideByProductId = new Map(
    overrides.map((override) => [override.productId, override]),
  );

  return products.map((product) =>
    applyPriceOverride(product, overrideByProductId.get(product.id)),
  );
});
