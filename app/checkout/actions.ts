"use server";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  orderItems,
  orders,
  productInventory,
} from "@/db/schema";
import { getAuthSession } from "@/auth";
import { getCurrentPricingTier } from "@/lib/member-pricing";
import {
  calculateReferralDiscountCents,
  getActiveReferralCode,
  isReconstitutionProduct,
} from "@/lib/referrals";
import {
  buildOrderItems,
  createOrderNumber,
  shippingOptions,
  type CheckoutCartItem,
  type ShippingMethod,
} from "@/lib/orders";
import { sendOrderCreatedEmail } from "@/lib/email";
import {
  syncInventoryLevelsToShipStation,
  syncOrderToShipStation,
} from "@/lib/shipstation";

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
  referralCode?: string;
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

    const shippingOption = shippingOptions[input.shippingMethod];

    if (!shippingOption) {
      return { ok: false, message: "Select a supported shipping method." };
    }

    const shippingPriceCents: number = shippingOption.priceCents;
    const subtotalCents = builtItems.reduce<number>(
      (total, item) => total + item.priceCents * item.quantity,
      0,
    );
    const referralCode = input.referralCode
      ? await getActiveReferralCode(input.referralCode)
      : null;
    const referralCodeInput = input.referralCode?.trim();

    if (referralCodeInput && !referralCode) {
      return { ok: false, message: "That referral code is not active." };
    }

    const discountEligibleSubtotalCents =
      referralCode?.excludeReconstitution
        ? builtItems.reduce<number>(
            (total, item) =>
              isReconstitutionProduct(item.productId)
                ? total
                : total + item.priceCents * item.quantity,
            0,
          )
        : subtotalCents;
    const referralDiscountCents = referralCode
      ? calculateReferralDiscountCents(
          discountEligibleSubtotalCents,
          referralCode.discountPercent,
        )
      : 0;
    const totalCents = subtotalCents - referralDiscountCents + shippingPriceCents;

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
          referralPartnerId: referralCode?.partnerId,
          referralCodeId: referralCode?.id,
          referralCode: referralCode?.code,
          referralDiscountCents,
          customerName: input.name.trim(),
          customerEmail: email,
          customerPhone: input.phone.trim(),
          addressLine1: input.address.trim(),
          addressLine2: input.address2?.trim() || null,
          city: input.city.trim(),
          state: input.state.trim(),
          postalCode: input.zip.trim(),
          paymentMethod: "venmo",
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
        ...(referralCode && referralDiscountCents > 0
          ? [
              {
                orderId: order.id,
                productId: `discount:${referralCode.code}`,
                name: `Referral discount ${referralCode.code}`,
                amount: `${referralCode.discountPercent}% off products${
                  referralCode.excludeReconstitution
                    ? " (excludes Reconstitution Solution)"
                    : ""
                }`,
                category: "Discount",
                priceCents: -referralDiscountCents,
                quantity: 1,
              },
            ]
          : []),
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

    try {
      const shipStationResult = await syncOrderToShipStation(
        result.order,
        result.insertedItems,
      );

      await db
        .update(orders)
        .set({
          shipStationShipmentId: shipStationResult.shipmentId,
          shipStationExternalShipmentId:
            shipStationResult.externalShipmentId,
          shipStationSyncStatus: shipStationResult.status,
          shipStationSyncError: shipStationResult.error,
          shipStationAddressValidationStatus:
            shipStationResult.addressValidation.status,
          shipStationAddressValidationMessage:
            shipStationResult.addressValidation.message,
          shipStationMatchedAddress:
            shipStationResult.addressValidation.matchedAddress,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, result.order.id));

      if (shipStationResult.status !== "synced") {
        console.error("Failed to sync order to ShipStation", {
          orderNumber: result.order.orderNumber,
          error: shipStationResult.error,
        });
      }
    } catch (error) {
      console.error("Failed to record ShipStation sync status", error);
    }

    try {
      const inventoryRows = await db
        .select()
        .from(productInventory)
        .where(
          inArray(
            productInventory.productId,
            builtItems.map((item) => item.productId),
          ),
        );
      const inventorySyncResults =
        await syncInventoryLevelsToShipStation(inventoryRows);

      for (const syncResult of inventorySyncResults) {
        await db
          .update(productInventory)
          .set({
            shipStationInventorySyncStatus: syncResult.status,
            shipStationInventorySyncError: syncResult.error,
            shipStationInventorySyncedAt: syncResult.syncedAt,
            updatedAt: new Date(),
          })
          .where(eq(productInventory.productId, syncResult.productId));
      }
    } catch (error) {
      console.error("Failed to sync checkout inventory to ShipStation", error);
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
