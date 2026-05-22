export const shippingOptions = {
  standard: {
    label: "Standard shipping",
    priceCents: 1500,
  },
  overnight: {
    label: "Overnight shipping",
    priceCents: 5000,
  },
} as const;

export type ShippingMethod = keyof typeof shippingOptions;
