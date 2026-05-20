"use server";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  orderItems,
  orders,
  productInventory,
  type PaymentMethod,
} from "@/db/schema";
import { getAuthSession } from "@/auth";
import { getCurrentPricingTier } from "@/lib/member-pricing";
import {
  buildOrderItems,
  createOrderNumber,
  shippingOptions,
  type CheckoutCartItem,
  type ShippingMethod,
} from "@/lib/orders";
import { sendOrderCreatedEmail } from "@/lib/email";

const paymentMethods = new Set<PaymentMethod>(["venmo", "zelle"]);

class StockError extends Error {}

type CheckoutInput = {
  name: string;
  phone: string;
  email: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  items: CheckoutCartItem[];
};

export type CheckoutResult =
  | { ok: true; orderNumber: string; email: string }
  | { ok: false; message: string };

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    const session = await getAuthSession();
    const email = input.email.trim().toLowerCase();
    const pricingTier = await getCurrentPricingTier();
    const builtItems = buildOrderItems(input.items, pricingTier);

    if (builtItems.length === 0) {
      return { ok: false, message: "Add at least one product before checkout." };
    }

    if (!paymentMethods.has(input.paymentMethod)) {
      return { ok: false, message: "Select a supported payment method." };
    }

    const shippingOption = shippingOptions[input.shippingMethod];

    if (!shippingOption) {
      return { ok: false, message: "Select a supported shipping method." };
    }

    const shippingPriceCents: number = shippingOption.priceCents;
    const totalCents = builtItems.reduce<number>(
      (total, item) => total + item.priceCents * item.quantity,
      shippingPriceCents,
    );

    const result = await db.transaction(async (tx) => {
      const inventoryRows = await tx
        .select()
        .from(productInventory)
        .where(
          inArray(
            productInventory.productId,
            builtItems.map((item) => item.productId),
          ),
        );
      const inventoryByProduct = new Map(
        inventoryRows.map((row) => [row.productId, row.quantity]),
      );
      const unavailableItem = builtItems.find(
        (item) =>
          (inventoryByProduct.get(item.productId) ?? 0) < item.stockQuantity,
      );

      if (unavailableItem) {
        return {
          ok: false as const,
          message: `${unavailableItem.name} ${unavailableItem.amount} does not have enough stock for that quantity.`,
        };
      }

      for (const item of builtItems) {
        const updatedInventory = await tx
          .update(productInventory)
          .set({
            quantity: sql`${productInventory.quantity} - ${item.stockQuantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(productInventory.productId, item.productId),
              gte(productInventory.quantity, item.stockQuantity),
            ),
          )
          .returning({ productId: productInventory.productId });

        if (updatedInventory.length === 0) {
          throw new StockError(
            `${item.name} ${item.amount} no longer has enough stock for that quantity.`,
          );
        }
      }

      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: createOrderNumber(),
          userId: session?.user?.id,
          customerName: input.name.trim(),
          customerEmail: email,
          customerPhone: input.phone.trim(),
          addressLine1: input.address.trim(),
          addressLine2: input.address2?.trim() || null,
          city: input.city.trim(),
          state: input.state.trim(),
          postalCode: input.zip.trim(),
          paymentMethod: input.paymentMethod,
          totalCents,
        })
        .returning();

      const orderItemValues = [
        ...builtItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          amount: item.amount,
          category: item.category,
          priceCents: item.priceCents,
          quantity: item.quantity,
        })),
        {
          orderId: order.id,
          productId: `shipping:${input.shippingMethod}`,
          name: shippingOption.label,
          amount: "Flat per order",
          category: "Shipping",
          priceCents: shippingPriceCents,
          quantity: 1,
        },
      ];

      const insertedItems = await tx
        .insert(orderItems)
        .values(orderItemValues)
        .returning();

      return { ok: true as const, order, insertedItems };
    });

    if (!result.ok) {
      return result;
    }

    await sendOrderCreatedEmail(result.order, result.insertedItems);
    revalidatePath("/");
    revalidatePath("/store");
    revalidatePath("/admin");

    return { ok: true, orderNumber: result.order.orderNumber, email };
  } catch (error) {
    if (error instanceof StockError) {
      return { ok: false, message: error.message };
    }

    console.error("Failed to create order", error);
    return {
      ok: false,
      message: "We could not create your order. Please check your details.",
    };
  }
}
