"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  orderItems,
  orders,
  productInventory,
  referralCodes,
  referralPartners,
  users,
  type Carrier,
  type PaymentStatus,
  type ShippingStatus,
} from "@/db/schema";
import { getAuthSession } from "@/auth";
import { products } from "@/app/products";
import { sendOrderStatusUpdatedEmail } from "@/lib/email";
import {
  getShipStationInventoryLevels,
  syncInventoryLevelToShipStation,
  syncInventoryLevelsToShipStation,
} from "@/lib/shipstation";
import { normalizeReferralCode } from "@/lib/referrals";

type OrderItem = typeof orderItems.$inferSelect;

async function requireAdmin() {
  const session = await getAuthSession();

  if (session?.user?.role !== "admin") {
    throw new Error("Admin access is required.");
  }
}

function getRestockQuantity(item: OrderItem) {
  if (
    item.productId.startsWith("shipping:") ||
    item.productId.startsWith("discount:")
  ) {
    return 0;
  }

  return item.quantity * (item.amount.includes("Kit (10 vials)") ? 10 : 1);
}

async function syncRestoredInventory(productIds: string[]) {
  const uniqueProductIds = Array.from(new Set(productIds));

  if (uniqueProductIds.length === 0) {
    return;
  }

  const inventoryRows = await db
    .select()
    .from(productInventory)
    .where(inArray(productInventory.productId, uniqueProductIds));
  const syncResults = await syncInventoryLevelsToShipStation(inventoryRows);

  for (const result of syncResults) {
    await db
      .update(productInventory)
      .set({
        shipStationInventorySyncStatus: result.status,
        shipStationInventorySyncError: result.error,
        shipStationInventorySyncedAt: result.syncedAt,
        updatedAt: new Date(),
      })
      .where(eq(productInventory.productId, result.productId));
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

  const syncResult = await syncInventoryLevelToShipStation(productId, quantity);

  await db
    .update(productInventory)
    .set({
      shipStationInventorySyncStatus: syncResult.status,
      shipStationInventorySyncError: syncResult.error,
      shipStationInventorySyncedAt: syncResult.syncedAt,
      updatedAt: new Date(),
    })
    .where(eq(productInventory.productId, productId));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/store");
}

export async function syncInventoryToShipStation() {
  await requireAdmin();

  const inventoryRows = await db.select().from(productInventory);
  const inventoryByProduct = new Map(
    inventoryRows.map((row) => [row.productId, row.quantity]),
  );
  const rowsToSync = products.map((product) => ({
    productId: product.id,
    quantity: inventoryByProduct.get(product.id) ?? 0,
  }));
  const syncResults = await syncInventoryLevelsToShipStation(rowsToSync);

  for (const result of syncResults) {
    await db
      .insert(productInventory)
      .values({
        productId: result.productId,
        quantity: inventoryByProduct.get(result.productId) ?? 0,
        shipStationInventorySyncStatus: result.status,
        shipStationInventorySyncError: result.error,
        shipStationInventorySyncedAt: result.syncedAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: productInventory.productId,
        set: {
          shipStationInventorySyncStatus: result.status,
          shipStationInventorySyncError: result.error,
          shipStationInventorySyncedAt: result.syncedAt,
          updatedAt: new Date(),
        },
      });
  }

  revalidatePath("/admin");
}

export async function pullInventoryFromShipStation() {
  await requireAdmin();

  const inventoryRows = await db.select().from(productInventory);
  const inventoryByProduct = new Map(
    inventoryRows.map((row) => [row.productId, row.quantity]),
  );
  let levels;

  try {
    levels = await getShipStationInventoryLevels(
      products.map((product) => product.id),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    for (const product of products) {
      await db
        .insert(productInventory)
        .values({
          productId: product.id,
          quantity: inventoryByProduct.get(product.id) ?? 0,
          shipStationInventorySyncStatus: "failed",
          shipStationInventorySyncError: message,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: productInventory.productId,
          set: {
            shipStationInventorySyncStatus: "failed",
            shipStationInventorySyncError: message,
            updatedAt: new Date(),
          },
        });
    }

    revalidatePath("/admin");
    return;
  }

  const levelsBySku = new Map(levels.map((level) => [level.sku, level]));
  const now = new Date();

  for (const product of products) {
    const level = levelsBySku.get(product.id);

    await db
      .insert(productInventory)
      .values({
        productId: product.id,
        quantity: level?.available ?? inventoryByProduct.get(product.id) ?? 0,
        shipStationInventorySyncStatus: level ? "synced" : "failed",
        shipStationInventorySyncError: level
          ? null
          : "No ShipStation inventory level returned for this SKU.",
        shipStationInventorySyncedAt: level ? now : null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: productInventory.productId,
        set: {
          quantity: level?.available ?? inventoryByProduct.get(product.id) ?? 0,
          shipStationInventorySyncStatus: level ? "synced" : "failed",
          shipStationInventorySyncError: level
            ? null
            : "No ShipStation inventory level returned for this SKU.",
          shipStationInventorySyncedAt: level ? now : null,
          updatedAt: now,
        },
      });
  }

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

function readDiscountPercent(formData: FormData) {
  const discountPercent = Number(formData.get("discountPercent") ?? 0);

  if (
    !Number.isInteger(discountPercent) ||
    discountPercent < 1 ||
    discountPercent > 100
  ) {
    throw new Error("Referral discount must be a whole percentage from 1 to 100.");
  }

  return discountPercent;
}

export async function createReferralPartner(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = normalizeReferralCode(String(formData.get("code") ?? ""));
  const discountPercent = readDiscountPercent(formData);
  const excludeReconstitution =
    formData.get("excludeReconstitution") === "on";

  if (!name) {
    throw new Error("Referral partner name is required.");
  }

  if (!code) {
    throw new Error("Referral code is required.");
  }

  await db.transaction(async (tx) => {
    const [partner] = await tx
      .insert(referralPartners)
      .values({ name, email: email || null })
      .returning();

    await tx.insert(referralCodes).values({
      partnerId: partner.id,
      code,
      discountPercent,
      excludeReconstitution,
    });
  });

  revalidatePath("/admin");
}

export async function createReferralCode(formData: FormData) {
  await requireAdmin();

  const partnerId = String(formData.get("partnerId") ?? "");
  const code = normalizeReferralCode(String(formData.get("code") ?? ""));
  const discountPercent = readDiscountPercent(formData);
  const excludeReconstitution =
    formData.get("excludeReconstitution") === "on";

  if (!partnerId) {
    throw new Error("Referral partner is required.");
  }

  if (!code) {
    throw new Error("Referral code is required.");
  }

  await db.insert(referralCodes).values({
    partnerId,
    code,
    discountPercent,
    excludeReconstitution,
  });

  revalidatePath("/admin");
}

export async function updateReferralCode(formData: FormData) {
  await requireAdmin();

  const codeId = String(formData.get("codeId") ?? "");
  const discountPercent = readDiscountPercent(formData);
  const isActive = formData.get("isActive") === "on";
  const excludeReconstitution =
    formData.get("excludeReconstitution") === "on";

  if (!codeId) {
    throw new Error("Referral code is required.");
  }

  await db
    .update(referralCodes)
    .set({
      discountPercent,
      isActive,
      excludeReconstitution,
      updatedAt: new Date(),
    })
    .where(eq(referralCodes.id, codeId));

  revalidatePath("/admin");
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

export async function cancelOrder(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "");

  if (!orderId) {
    throw new Error("Order is required.");
  }

  const result = await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));

    if (!order) {
      throw new Error("Order was not found.");
    }

    const items = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));
    const restoredProductIds: string[] = [];
    const now = new Date();

    if (!order.inventoryRestoredAt) {
      for (const item of items) {
        const restockQuantity = getRestockQuantity(item);

        if (restockQuantity === 0) {
          continue;
        }

        restoredProductIds.push(item.productId);

        await tx
          .insert(productInventory)
          .values({
            productId: item.productId,
            quantity: restockQuantity,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: productInventory.productId,
            set: {
              quantity: sql`${productInventory.quantity} + ${restockQuantity}`,
              shipStationInventorySyncStatus: "pending",
              shipStationInventorySyncError: null,
              updatedAt: now,
            },
          });
      }
    }

    const [cancelledOrder] = await tx
      .update(orders)
      .set({
        orderStatus: "cancelled",
        cancelledAt: order.cancelledAt ?? now,
        inventoryRestoredAt: order.inventoryRestoredAt ?? now,
        updatedAt: now,
      })
      .where(eq(orders.id, order.id))
      .returning();

    return { order: cancelledOrder, items, restoredProductIds };
  });

  await syncRestoredInventory(result.restoredProductIds);
  await sendOrderStatusUpdatedEmail(result.order, result.items);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/store");
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "");

  if (!orderId) {
    throw new Error("Order is required.");
  }

  const restoredProductIds = await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));

    if (!order) {
      throw new Error("Order was not found.");
    }

    const items = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));
    const productIds: string[] = [];
    const now = new Date();

    if (!order.inventoryRestoredAt) {
      for (const item of items) {
        const restockQuantity = getRestockQuantity(item);

        if (restockQuantity === 0) {
          continue;
        }

        productIds.push(item.productId);

        await tx
          .insert(productInventory)
          .values({
            productId: item.productId,
            quantity: restockQuantity,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: productInventory.productId,
            set: {
              quantity: sql`${productInventory.quantity} + ${restockQuantity}`,
              shipStationInventorySyncStatus: "pending",
              shipStationInventorySyncError: null,
              updatedAt: now,
            },
          });
      }
    }

    await tx.delete(orders).where(eq(orders.id, order.id));

    return productIds;
  });

  await syncRestoredInventory(restoredProductIds);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/store");
}
