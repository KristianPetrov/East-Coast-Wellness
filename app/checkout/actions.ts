"use server";

import { db } from "@/db";
import { orderItems, orders, type PaymentMethod } from "@/db/schema";
import { getAuthSession } from "@/auth";
import {
  buildOrderItems,
  createOrderNumber,
  type CheckoutCartItem,
} from "@/lib/orders";
import { sendOrderCreatedEmail } from "@/lib/email";

const paymentMethods = new Set<PaymentMethod>(["cashapp", "venmo", "zelle"]);

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

    const [order] = await db
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

    const insertedItems = await db
      .insert(orderItems)
      .values(builtItems.map((item) => ({ ...item, orderId: order.id })))
      .returning();

    await sendOrderCreatedEmail(order, insertedItems);

    return { ok: true, orderNumber: order.orderNumber, email };
  } catch (error) {
    console.error("Failed to create order", error);
    return {
      ok: false,
      message: "We could not create your order. Please check your details.",
    };
  }
}
