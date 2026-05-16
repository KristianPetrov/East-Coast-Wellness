import type { Product } from "./products";

export const cartStorageKey = "ecw-cart-v1";
export const cartUpdatedEvent = "ecw-cart-updated";

export type CartItem = Product & {
  quantity: number;
};

export function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem(cartStorageKey);
    return storedCart ? (JSON.parse(storedCart) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  window.dispatchEvent(new Event(cartUpdatedEvent));
}

export function addProductToCart(product: Product) {
  const cart = readCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
    saveCart(cart);
    return;
  }

  saveCart([...cart, { ...product, quantity: 1 }]);
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
