import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "cashapp",
  "venmo",
  "zelle",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
]);
export const shippingStatusEnum = pgEnum("shipping_status", [
  "pending",
  "shipped",
]);
export const carrierEnum = pgEnum("carrier", ["USPS", "UPS"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  memberPricingEnabled: boolean("member_pricing_enabled")
    .notNull()
    .default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const productInventory = pgTable("product_inventory", {
  productId: text("product_id").primaryKey(),
  quantity: integer("quantity").notNull().default(0),
  shipStationInventorySyncStatus: text("ship_station_inventory_sync_status")
    .notNull()
    .default("pending"),
  shipStationInventorySyncError: text("ship_station_inventory_sync_error"),
  shipStationInventorySyncedAt: timestamp("ship_station_inventory_synced_at", {
    withTimezone: true,
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const referralPartners = pgTable("referral_partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const referralCodes = pgTable(
  "referral_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    partnerId: uuid("partner_id")
      .notNull()
      .references(() => referralPartners.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    discountPercent: integer("discount_percent").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    excludeReconstitution: boolean("exclude_reconstitution")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("referral_codes_code_idx").on(table.code)],
);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  referralPartnerId: uuid("referral_partner_id").references(
    () => referralPartners.id,
    { onDelete: "set null" },
  ),
  referralCodeId: uuid("referral_code_id").references(() => referralCodes.id, {
    onDelete: "set null",
  }),
  referralCode: text("referral_code"),
  referralDiscountCents: integer("referral_discount_cents")
    .notNull()
    .default(0),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  shippingStatus: shippingStatusEnum("shipping_status")
    .notNull()
    .default("pending"),
  orderStatus: text("order_status").notNull().default("active"),
  carrier: carrierEnum("carrier"),
  trackingNumber: text("tracking_number"),
  totalCents: integer("total_cents").notNull(),
  shipStationShipmentId: text("ship_station_shipment_id"),
  shipStationExternalShipmentId: text("ship_station_external_shipment_id"),
  shipStationSyncStatus: text("ship_station_sync_status")
    .notNull()
    .default("pending"),
  shipStationSyncError: text("ship_station_sync_error"),
  shipStationAddressValidationStatus: text(
    "ship_station_address_validation_status",
  ),
  shipStationAddressValidationMessage: text(
    "ship_station_address_validation_message",
  ),
  shipStationMatchedAddress: text("ship_station_matched_address"),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  inventoryRestoredAt: timestamp("inventory_restored_at", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  amount: text("amount").notNull(),
  category: text("category").notNull(),
  priceCents: integer("price_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type ShippingStatus = (typeof shippingStatusEnum.enumValues)[number];
export type Carrier = (typeof carrierEnum.enumValues)[number];
