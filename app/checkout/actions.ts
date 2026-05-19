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
import {
  buildOrderItems,
  createOrderNumber,
  type CheckoutCartItem,
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
    const builtItems = buildOrderItems(input.items);

    if (builtItems.length === 0) {
      return { ok: false, message: "Add at least one product before checkout." };
    }

    if (!paymentMethods.has(input.paymentMethod)) {
      return { ok: false, message: "Select a supported payment method." };
    }

    const totalCents = builtItems.reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0,
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
        (item) => (inventoryByProduct.get(item.productId) ?? 0) < item.quantity,
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
            quantity: sql`${productInventory.quantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(productInventory.productId, item.productId),
              gte(productInventory.quantity, item.quantity),
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

      const insertedItems = await tx
        .insert(orderItems)
        .values(builtItems.map((item) => ({ ...item, orderId: order.id })))
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
