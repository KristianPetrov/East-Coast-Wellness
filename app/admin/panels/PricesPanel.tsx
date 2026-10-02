import { formatPrice, hasKitPricing, products, type Product } from "@/app/products";
import { StatusPill } from "@/app/ui";
import { resetProductPrices, updateProductPrices } from "../actions";
import { SubmitButton } from "../FormButtons";
import { adminInput, adminLabel, EmptyState, PanelHeader, SearchBox } from "../ui";

function PriceField({
  name,
  label,
  value,
  defaultPrice,
}: {
  name: string;
  label: string;
  value: number | undefined;
  defaultPrice: number;
}) {
  const isChanged = value !== undefined && value !== defaultPrice;

  return (
    <label className={adminLabel}>
      {label}
      <span className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-faint">
          $
        </span>
        <input
          name={name}
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          required
          defaultValue={value}
          className={`${adminInput} no-spin pl-7 tabular-nums ${isChanged ? "border-copper/40! bg-copper-wash/40!" : ""}`}
        />
      </span>
      <span className="text-[11px] font-normal normal-case tracking-normal text-faint">
        Default {formatPrice(defaultPrice)}
      </span>
    </label>
  );
}

export function PricesPanel({
  pricedProductById,
  customPriceProductIds,
  query,
}: {
  pricedProductById: Map<string, Product>;
  customPriceProductIds: Set<string>;
  query?: string;
}) {
  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const visible = products.filter(
    (product) =>
      !normalizedQuery ||
      [product.name, product.amount, product.id].join(" ").toLowerCase().includes(normalizedQuery),
  );

  return (
    <div className="grid gap-8">
      <PanelHeader
        title="Prices"
        description={
          <>
            Changes apply to the storefront and checkout immediately. Items
            already in a customer&apos;s cart are re-priced at the new amount,
            and existing orders keep the price they were placed at. Use whole
            dollars or include cents (59.50).
          </>
        }
        actions={
          <StatusPill tone={customPriceProductIds.size > 0 ? "accent" : "neutral"}>
            {customPriceProductIds.size} custom {customPriceProductIds.size === 1 ? "price" : "prices"}
          </StatusPill>
        }
      />

      <SearchBox tab="prices" query={query} placeholder="Search products" />

      {visible.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
          {visible.map((product, index) => {
            const current = pricedProductById.get(product.id) ?? product;
            const sellsKits = hasKitPricing(product);
            const isCustom = customPriceProductIds.has(product.id);

            return (
              <form
                key={product.id}
                action={updateProductPrices}
                className={`grid gap-4 px-5 py-5 transition hover:bg-bone/70 xl:grid-cols-[minmax(12rem,1fr)_3fr_auto] xl:items-start ${
                  index > 0 ? "border-t border-ink/8" : ""
                }`}
              >
                <input type="hidden" name="productId" value={product.id} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{product.name}</p>
                    {isCustom ? <StatusPill tone="accent">Custom</StatusPill> : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {product.amount} · <span className="font-mono">{product.id}</span>
                  </p>
                </div>
                <div className={`grid gap-3 ${sellsKits ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}>
                  <PriceField
                    name="retailVialPrice"
                    label="Retail vial"
                    value={current.retailVialPrice}
                    defaultPrice={product.retailVialPrice}
                  />
                  <PriceField
                    name="memberVialPrice"
                    label="Member vial"
                    value={current.memberVialPrice}
                    defaultPrice={product.memberVialPrice}
                  />
                  {sellsKits ? (
                    <>
                      <PriceField
                        name="retailKitPrice"
                        label="Retail kit (10)"
                        value={current.retailKitPrice}
                        defaultPrice={product.retailKitPrice!}
                      />
                      <PriceField
                        name="memberKitPrice"
                        label="Member kit (10)"
                        value={current.memberKitPrice}
                        defaultPrice={product.memberKitPrice!}
                      />
                    </>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 xl:flex-col xl:pt-5">
                  <SubmitButton formAction={updateProductPrices} savedLabel="Saved">
                    Save prices
                  </SubmitButton>
                  {isCustom ? (
                    <SubmitButton
                      variant="secondary"
                      formAction={resetProductPrices}
                      formNoValidate
                      pendingLabel="Resetting…"
                      savedLabel="Reset"
                      confirmMessage={`Reset ${product.name} ${product.amount} to default prices?`}
                    >
                      Reset to default
                    </SubmitButton>
                  ) : null}
                </div>
              </form>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No matching products">Try another search term.</EmptyState>
      )}
    </div>
  );
}
