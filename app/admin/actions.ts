"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  orderItems,
  orders,
  productInventory,
  users,
  type Carrier,
  type PaymentStatus,
  type ShippingStatus,
} from "@/db/schema";
import { getAuthSession } from "@/auth";
import { sendOrderStatusUpdatedEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await getAuthSession();

  if (session?.user?.role !== "admin") {
    throw new Error("Admin access is required.");
  }
}

export async function updateInventory(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);

  if (!productId || !Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Inventory quantity must be a positive whole number.");
  }

  await db
    .insert(productInventory)
    .values({ productId, quantity, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: productInventory.productId,
      set: { quantity, updatedAt: new Date() },
    });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/store");
}

export async function updateMemberPricing(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const memberPricingEnabled = formData.get("memberPricingEnabled") === "on";

  if (!userId) {
    throw new Error("Account is required.");
  }

  await db
    .update(users)
    .set({ memberPricingEnabled, updatedAt: new Date() })
    .where(eq(users.id, userId));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/store");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "");
  const paymentStatus = String(
    formData.get("paymentStatus") ?? "pending",
  ) as PaymentStatus;
  const shippingStatus = String(
    formData.get("shippingStatus") ?? "pending",
  ) as ShippingStatus;
  const carrierValue = String(formData.get("carrier") ?? "");
  const carrier = carrierValue ? (carrierValue as Carrier) : null;
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();

  if (!orderId) {
    throw new Error("Order is required.");
  }

  const [order] = await db
    .update(orders)
    .set({
      paymentStatus,
      shippingStatus,
      carrier,
      trackingNumber: trackingNumber || null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  if (order) {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    await sendOrderStatusUpdatedEmail(order, items);
  }

  revalidatePath("/admin");
}
