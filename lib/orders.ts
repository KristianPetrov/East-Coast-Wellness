import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, type PaymentMethod } from "@/db/schema";
import { products } from "@/app/products";
import { dollarsToCents } from "./money";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cashapp: "Cash App",
  venmo: "Venmo",
  zelle: "Zelle",
};

export const paymentInstructions: Record<PaymentMethod, string> = {
  cashapp:
    process.env.CASHAPP_PAYMENT_HANDLE ??
    "Send payment through Cash App and include your order number in the note.",
  venmo:
    process.env.VENMO_PAYMENT_HANDLE ??
    "Send payment through Venmo and include your order number in the note.",
  zelle:
    process.env.ZELLE_PAYMENT_HANDLE ??
    "Send payment through Zelle and include your order number in the memo.",
};

export type CheckoutCartItem = {
  id: string;
  quantity: number;
};

export function createOrderNumber() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ECW-${Date.now().toString(36).toUpperCase()}-${random}`;
}

export function buildOrderItems(cartItems: CheckoutCartItem[]) {
  const productById = new Map(products.map((product) => [product.id, product]));

  return cartItems.map((item) => {
    const product = productById.get(item.id);
    const quantity = Number(item.quantity);

    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Your cart contains an unavailable product.");
    }

    return {
      productId: product.id,
      name: product.name,
      amount: product.amount,
      category: product.category,
      priceCents: dollarsToCents(product.price),
      quantity,
    };
  });
}

export async function getOrderByNumberForEmail(
  orderNumber: string,
  email: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.orderNumber, orderNumber.trim().toUpperCase()),
        eq(orders.customerEmail, normalizedEmail),
      ),
    );

  if (!order) {
    return null;
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return { order, items };
}

export async function getOrdersForUser(userId: string) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}
