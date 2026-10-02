import type { productInventory } from "@/db/schema";
import { products } from "@/app/products";
import { StatusPill } from "@/app/ui";
import {
  pullInventoryFromShipStation,
  syncInventoryToShipStation,
  updateInventory,
} from "../actions";
import { SubmitButton } from "../FormButtons";
import {
  adminInput,
  EmptyState,
  FilterTabs,
  PanelHeader,
  SearchBox,
  StatCard,
} from "../ui";

type InventoryRow = typeof productInventory.$inferSelect;

export const LOW_STOCK_THRESHOLD = 5;

export type StockFilter = "all" | "alerts" | "out";

export function InventoryPanel({
  inventoryRows,
  stockFilter,
  query,
  shipStationEnabled,
  shipStationInventoryConfigured,
}: {
  inventoryRows: InventoryRow[];
  stockFilter: StockFilter;
  query?: string;
  shipStationEnabled: boolean;
  shipStationInventoryConfigured: boolean;
}) {
  const inventoryByProduct = new Map(inventoryRows.map((row) => [row.productId, row]));
  const quantityOf = (id: string) => inventoryByProduct.get(id)?.quantity ?? 0;
  const totalUnits = products.reduce((total, product) => total + quantityOf(product.id), 0);
  const outOfStock = products.filter((product) => quantityOf(product.id) <= 0);
  const lowStock = products.filter((product) => {
    const quantity = quantityOf(product.id);
    return quantity > 0 && quantity <= LOW_STOCK_THRESHOLD;
  });
  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const visible = products.filter((product) => {
    const quantity = quantityOf(product.id);
    const matchesStock =
      stockFilter === "out"
        ? quantity <= 0
        : stockFilter === "alerts"
          ? quantity <= LOW_STOCK_THRESHOLD
          : true;
    const matchesQuery =
      !normalizedQuery ||
      [product.name, product.amount, product.id].join(" ").toLowerCase().includes(normalizedQuery);

    return matchesStock && matchesQuery;
  });
  const filterHref = (key: StockFilter) => {
    const params = new URLSearchParams({ tab: "inventory" });
    if (key !== "all") params.set("stock", key);
    if (query) params.set("q", query);
    return `/admin?${params.toString()}`;
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8">
      <PanelHeader
        title="Inventory"
        description="Stock shown here appears on the storefront and is decremented when checkout creates an order. Update quantities as you receive stock."
        actions={
          shipStationEnabled ? (
            <>
              <form action={syncInventoryToShipStation}>
                <SubmitButton pendingLabel="Pushing…" savedLabel="Pushed">
                  Push to ShipStation
                </SubmitButton>
              </form>
              <form action={pullInventoryFromShipStation}>
                <SubmitButton variant="secondary" pendingLabel="Pulling…" savedLabel="Pulled">
                  Pull from ShipStation
                </SubmitButton>
              </form>
            </>
          ) : undefined
        }
      />

      {shipStationEnabled ? (
        <p
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            shipStationInventoryConfigured
              ? "border-sage/20 bg-sage-wash text-sage"
              : "border-rust/20 bg-rust-wash text-rust"
          }`}
        >
          ShipStation inventory sync is{" "}
          {shipStationInventoryConfigured ? "configured" : "not configured"}.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Variants" value={products.length} hint="Across the catalog" />
        <StatCard label="Units on hand" value={totalUnits} hint="All variants" tone="success" />
        <StatCard
          label="Low stock"
          value={lowStock.length}
          hint={`${LOW_STOCK_THRESHOLD} or fewer left`}
          tone={lowStock.length > 0 ? "warning" : "neutral"}
          href={filterHref("alerts")}
        />
        <StatCard
          label="Out of stock"
          value={outOfStock.length}
          hint="Shown as sold out"
          tone={outOfStock.length > 0 ? "danger" : "neutral"}
          href={filterHref("out")}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          active={stockFilter}
          options={[
            { key: "all", label: "All", count: products.length, href: filterHref("all") },
            {
              key: "alerts",
              label: "Needs attention",
              count: lowStock.length + outOfStock.length,
              href: filterHref("alerts"),
            },
            { key: "out", label: "Out of stock", count: outOfStock.length, href: filterHref("out") },
          ]}
        />
        <SearchBox
          tab="inventory"
          query={query}
          placeholder="Search products"
          hidden={{ stock: stockFilter === "all" ? undefined : stockFilter }}
        />
      </div>

      {visible.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
          <div className="hidden grid-cols-[1fr_9rem_7rem_6.5rem] items-center gap-4 border-b border-ink/10 bg-bone px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint sm:grid">
            <span>Product</span>
            <span>Status</span>
            <span>Quantity</span>
            <span />
          </div>
          {visible.map((product, index) => {
            const quantity = quantityOf(product.id);
            const sync = inventoryByProduct.get(product.id);

            return (
              <form
                key={product.id}
                action={updateInventory}
                className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-5 py-4 transition hover:bg-bone/70 sm:grid-cols-[1fr_9rem_7rem_6.5rem] ${
                  index > 0 ? "border-t border-ink/8" : ""
                }`}
              >
                <input type="hidden" name="productId" value={product.id} />
                <div className="min-w-0">
                  <p className="font-medium">{product.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {product.amount} · <span className="font-mono">{product.id}</span>
                  </p>
                  {shipStationEnabled ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <StatusPill
                        tone={
                          sync?.shipStationInventorySyncStatus === "synced"
                            ? "success"
                            : sync?.shipStationInventorySyncStatus === "failed"
                              ? "danger"
                              : "neutral"
                        }
                      >
                        ShipStation {sync?.shipStationInventorySyncStatus ?? "pending"}
                      </StatusPill>
                      {sync?.shipStationInventorySyncedAt ? (
                        <span>Last synced {sync.shipStationInventorySyncedAt.toLocaleString()}</span>
                      ) : null}
                      {sync?.shipStationInventorySyncError ? (
                        <span className="font-medium text-rust">
                          {sync.shipStationInventorySyncError}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="justify-self-end sm:justify-self-start">
                  {quantity <= 0 ? (
                    <StatusPill tone="danger">Out of stock</StatusPill>
                  ) : quantity <= LOW_STOCK_THRESHOLD ? (
                    <StatusPill tone="warning">Low · {quantity}</StatusPill>
                  ) : (
                    <StatusPill tone="success">{quantity} in stock</StatusPill>
                  )}
                </div>
                <input
                  name="quantity"
                  type="number"
                  min={0}
                  step={1}
                  required
                  defaultValue={quantity}
                  aria-label={`${product.name} ${product.amount} quantity`}
                  className={`${adminInput} no-spin tabular-nums`}
                />
                <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
              </form>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Nothing to show">
          {stockFilter === "all"
            ? "No products match that search."
            : "Every variant in this view is well stocked."}
        </EmptyState>
      )}
    </div>
  );
}
