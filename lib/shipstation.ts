import type { orderItems, orders, productInventory } from "@/db/schema";

type Order = typeof orders.$inferSelect;
type OrderItem = typeof orderItems.$inferSelect;
type ProductInventory = typeof productInventory.$inferSelect;

type ShipStationAddressValidation = {
  status: string | null;
  message: string | null;
  matchedAddress: string | null;
};

type ShipStationSyncResult =
  | {
      status: "synced";
      shipmentId: string | null;
      externalShipmentId: string;
      error: null;
      addressValidation: ShipStationAddressValidation;
    }
  | {
      status: "failed" | "skipped";
      shipmentId: null;
      externalShipmentId: string;
      error: string;
      addressValidation: ShipStationAddressValidation;
    };

export type ShipStationInventorySyncResult = {
  status: "synced" | "failed" | "skipped";
  error: string | null;
  syncedAt: Date | null;
};

export type ShipStationInventoryLevel = {
  sku: string;
  onHand: number;
  allocated: number;
  available: number;
};

const shipStationBaseUrl = "https://api.shipstation.com";
const noAddressValidation: ShipStationAddressValidation = {
  status: null,
  message: null,
  matchedAddress: null,
};
const originAddress = {
  name: "CWG LLC",
  phone: "(307) 210-6352",
  email: "lsasso@coastalwellnessgroup.co",
  company_name: "CWG LLC",
  address_line1: "1701 E Empire St Ste 360 #170",
  address_line2: null,
  address_line3: null,
  city_locality: "Bloomington",
  state_province: "IL",
  postal_code: "61704-7900",
  country_code: "US",
  address_residential_indicator: "no",
};

function centsToDollars(cents: number) {
  return Number((cents / 100).toFixed(2));
}

function getShippingItem(items: OrderItem[]) {
  return items.find((item) => item.productId.startsWith("shipping:"));
}

function getProductItems(items: OrderItem[]) {
  return items.filter((item) => !item.productId.startsWith("shipping:"));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown ShipStation error";
}

function truncateSyncError(message: string) {
  return message.slice(0, 1_000);
}

function readConfigValue(value: string | undefined) {
  const trimmed = value?.trim();

  if (
    !trimmed ||
    trimmed.toLowerCase() === "null" ||
    trimmed.toLowerCase() === "undefined"
  ) {
    return undefined;
  }

  return trimmed;
}

function getApiKey() {
  return readConfigValue(process.env.SHIP_STATION_API_KEY);
}

function getInventoryLocationId() {
  return readConfigValue(process.env.SHIP_STATION_INVENTORY_LOCATION_ID);
}

async function requestShipStation(path: string, init?: RequestInit) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("SHIP_STATION_API_KEY is not configured.");
  }

  const response = await fetch(`${shipStationBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      ...init?.headers,
    },
  });
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`ShipStation returned ${response.status}: ${responseText}`);
  }

  return responseText ? JSON.parse(responseText) : null;
}

function readShipmentId(responseBody: unknown) {
  if (!responseBody || typeof responseBody !== "object") {
    return null;
  }

  if (
    "shipment_id" in responseBody &&
    typeof responseBody.shipment_id === "string"
  ) {
    return responseBody.shipment_id;
  }

  if (!("shipments" in responseBody) || !Array.isArray(responseBody.shipments)) {
    return null;
  }

  const [shipment] = responseBody.shipments;

  if (
    shipment &&
    typeof shipment === "object" &&
    "shipment_id" in shipment &&
    typeof shipment.shipment_id === "string"
  ) {
    return shipment.shipment_id;
  }

  return null;
}

function readInventoryLocationId(responseBody: unknown) {
  if (!responseBody || typeof responseBody !== "object") {
    return null;
  }

  if (
    !("inventory_locations" in responseBody) ||
    !Array.isArray(responseBody.inventory_locations)
  ) {
    return null;
  }

  const [location] = responseBody.inventory_locations;

  if (
    location &&
    typeof location === "object" &&
    "inventory_location_id" in location &&
    typeof location.inventory_location_id === "string"
  ) {
    return location.inventory_location_id;
  }

  return null;
}

async function resolveInventoryLocationId() {
  const configuredLocationId = getInventoryLocationId();

  if (configuredLocationId) {
    return configuredLocationId;
  }

  const responseBody = await requestShipStation(
    "/v2/inventory_locations?page_size=1",
  );
  const discoveredLocationId = readInventoryLocationId(responseBody);

  if (discoveredLocationId) {
    return discoveredLocationId;
  }

  throw new Error(
    "SHIP_STATION_INVENTORY_LOCATION_ID is not configured and no ShipStation inventory locations were returned.",
  );
}

function readShipments(responseBody: unknown) {
  if (!responseBody || typeof responseBody !== "object") {
    return [];
  }

  if (!("shipments" in responseBody) || !Array.isArray(responseBody.shipments)) {
    return [];
  }

  return responseBody.shipments;
}

function formatMatchedAddress(address: unknown) {
  if (!address || typeof address !== "object") {
    return null;
  }

  const value = address as Record<string, unknown>;
  const lines = [
    value.address_line1,
    value.address_line2,
    [value.city_locality, value.state_province, value.postal_code]
      .filter(Boolean)
      .join(", "),
    value.country_code,
  ]
    .filter((line): line is string => typeof line === "string" && line !== "")
    .join("\n");

  return lines || null;
}

function readAddressValidation(responseBody: unknown): ShipStationAddressValidation {
  const [shipment] = readShipments(responseBody);

  if (!shipment || typeof shipment !== "object") {
    return noAddressValidation;
  }

  if (
    !("address_validation" in shipment) ||
    !shipment.address_validation ||
    typeof shipment.address_validation !== "object"
  ) {
    return noAddressValidation;
  }

  const validation = shipment.address_validation as Record<string, unknown>;
  const messages = Array.isArray(validation.messages)
    ? validation.messages
        .map((message) =>
          message && typeof message === "object" && "message" in message
            ? message.message
            : null,
        )
        .filter((message): message is string => typeof message === "string")
    : [];

  return {
    status:
      typeof validation.status === "string" ? validation.status : null,
    message: messages.length > 0 ? messages.join("; ") : null,
    matchedAddress: formatMatchedAddress(validation.matched_address),
  };
}

function buildShipStationShipment(order: Order, items: OrderItem[]) {
  const shippingItem = getShippingItem(items);
  const productItems = getProductItems(items);

  return {
    external_shipment_id: order.orderNumber,
    external_order_id: order.orderNumber,
    create_sales_order: true,
    shipment_status: "pending",
    validate_address: "validate_and_clean",
    confirmation: "delivery",
    amount_paid: {
      currency: "usd",
      amount: centsToDollars(order.totalCents),
    },
    shipping_paid: {
      currency: "usd",
      amount: centsToDollars(shippingItem?.priceCents ?? 0),
    },
    ship_to: {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail,
      company_name: null,
      address_line1: order.addressLine1,
      address_line2: order.addressLine2,
      address_line3: null,
      city_locality: order.city,
      state_province: order.state,
      postal_code: order.postalCode,
      country_code: "US",
      address_residential_indicator: "unknown",
    },
    ship_from: originAddress,
    return_to: originAddress,
    items: productItems.map((item) => ({
      name: `${item.name} ${item.amount}`,
      quantity: item.quantity,
      sku: item.productId,
      external_order_id: order.orderNumber,
      external_order_item_id: item.id,
      unit_price: centsToDollars(item.priceCents),
    })),
    advanced_options: {},
  };
}

export async function syncOrderToShipStation(
  order: Order,
  items: OrderItem[],
): Promise<ShipStationSyncResult> {
  if (!getApiKey()) {
    return {
      status: "skipped",
      shipmentId: null,
      externalShipmentId: order.orderNumber,
      error: "SHIP_STATION_API_KEY is not configured.",
      addressValidation: noAddressValidation,
    };
  }

  try {
    const responseBody = await requestShipStation("/v2/shipments", {
      method: "POST",
      body: JSON.stringify({
        shipments: [buildShipStationShipment(order, items)],
      }),
    });

    return {
      status: "synced",
      shipmentId: readShipmentId(responseBody),
      externalShipmentId: order.orderNumber,
      error: null,
      addressValidation: readAddressValidation(responseBody),
    };
  } catch (error) {
    return {
      status: "failed",
      shipmentId: null,
      externalShipmentId: order.orderNumber,
      error: truncateSyncError(getErrorMessage(error)),
      addressValidation: noAddressValidation,
    };
  }
}

export async function syncInventoryLevelToShipStation(
  productId: string,
  quantity: number,
): Promise<ShipStationInventorySyncResult> {
  if (!getApiKey()) {
    return {
      status: "skipped",
      error: "SHIP_STATION_API_KEY is not configured.",
      syncedAt: null,
    };
  }

  let inventoryLocationId: string;

  try {
    inventoryLocationId = await resolveInventoryLocationId();
  } catch (error) {
    return {
      status: "skipped",
      error: truncateSyncError(getErrorMessage(error)),
      syncedAt: null,
    };
  }

  try {
    await requestShipStation("/v2/inventory", {
      method: "POST",
      body: JSON.stringify({
        transaction_type: "adjust",
        inventory_location_id: inventoryLocationId,
        sku: productId,
        quantity,
        condition: "sellable",
        reason: "Website inventory sync",
        notes: "Synced from East Coast Wellness admin/storefront stock.",
      }),
    });

    return { status: "synced", error: null, syncedAt: new Date() };
  } catch (error) {
    return {
      status: "failed",
      error: truncateSyncError(getErrorMessage(error)),
      syncedAt: null,
    };
  }
}

export async function syncInventoryLevelsToShipStation(
  inventoryRows: Pick<ProductInventory, "productId" | "quantity">[],
) {
  const results = await Promise.all(
    inventoryRows.map(async (row) => ({
      productId: row.productId,
      ...(await syncInventoryLevelToShipStation(row.productId, row.quantity)),
    })),
  );

  return results;
}

function readInventoryLevels(responseBody: unknown): ShipStationInventoryLevel[] {
  if (!responseBody || typeof responseBody !== "object") {
    return [];
  }

  if (!("inventory" in responseBody) || !Array.isArray(responseBody.inventory)) {
    return [];
  }

  return responseBody.inventory
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const value = row as Record<string, unknown>;

      if (typeof value.sku !== "string") {
        return null;
      }

      return {
        sku: value.sku,
        onHand: typeof value.on_hand === "number" ? value.on_hand : 0,
        allocated: typeof value.allocated === "number" ? value.allocated : 0,
        available: typeof value.available === "number" ? value.available : 0,
      };
    })
    .filter((row): row is ShipStationInventoryLevel => row !== null);
}

export async function getShipStationInventoryLevels(productIds: string[]) {
  if (!getApiKey()) {
    throw new Error("SHIP_STATION_API_KEY is not configured.");
  }

  const inventoryLocationId = await resolveInventoryLocationId().catch(
    () => undefined,
  );
  const levels: ShipStationInventoryLevel[] = [];

  for (const productId of productIds) {
    const params = new URLSearchParams({
      sku: productId,
      page_size: "50",
    });

    if (inventoryLocationId) {
      params.set("inventory_location_id", inventoryLocationId);
    }

    const responseBody = await requestShipStation(
      `/v2/inventory?${params.toString()}`,
    );

    levels.push(...readInventoryLevels(responseBody));
  }

  return levels;
}
