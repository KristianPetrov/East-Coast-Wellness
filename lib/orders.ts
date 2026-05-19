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
    "Cash App is no longer accepted. Please contact support for another payment method.",
  venmo: "Pay @coastalwellnessgroupllc through Venmo.",
  zelle: "Send Zelle payment to 307-210-6352.",
};

type OrderPaymentDetailsInput = Pick<
  typeof orders.$inferSelect,
  "orderNumber" | "paymentMethod" | "totalCents"
>;

const venmoHandle = "coastalwellnessgroupllc";
const zellePhone = "307-210-6352";

export function buildVenmoPaymentUrl(order: OrderPaymentDetailsInput) {
  const params = new URLSearchParams({
    txn: "pay",
    recipients: venmoHandle,
    amount: (order.totalCents / 100).toFixed(2),
    note: `East Coast Wellness ${order.orderNumber}`,
  });

  return `https://venmo.com/?${params.toString()}`;
}

export function getPaymentDetails(order: OrderPaymentDetailsInput) {
  if (order.paymentMethod === "venmo") {
    return {
      label: paymentMethodLabels.venmo,
      instruction:
        "Pay @coastalwellnessgroupllc through Venmo. The link includes your order total and order number.",
      href: buildVenmoPaymentUrl(order),
      actionLabel: "Pay with Venmo",
    };
  }

  if (order.paymentMethod === "zelle") {
    return {
      label: paymentMethodLabels.zelle,
      instruction: `Send Zelle payment to ${zellePhone} and include ${order.orderNumber} in the memo.`,
      href: null,
      actionLabel: null,
    };
  }

  return {
    label: paymentMethodLabels.cashapp,
    instruction: paymentInstructions.cashapp,
    href: null,
    actionLabel: null,
  };
}

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
