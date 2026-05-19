"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  orders,
  productInventory,
  type Carrier,
  type PaymentStatus,
  type ShippingStatus,
} from "@/db/schema";
import { getAuthSession } from "@/auth";

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

  await db
    .update(orders)
    .set({
      paymentStatus,
      shippingStatus,
      carrier,
      trackingNumber: trackingNumber || null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin");
}
