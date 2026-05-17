export function dollarsToCents(amount: number) {
  return Math.round(amount * 100);
}

export function formatCents(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}
