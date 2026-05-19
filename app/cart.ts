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
  window.localStorage.setItem(
    cartStorageKey,
    JSON.stringify(items.filter((item) => item.quantity > 0)),
  );
  window.dispatchEvent(new Event(cartUpdatedEvent));
}

export function addProductToCart(product: Product, maxQuantity?: number) {
  const cart = readCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    if (maxQuantity !== undefined && existingItem.quantity >= maxQuantity) {
      return false;
    }

    existingItem.quantity += 1;
    saveCart(cart);
    return true;
  }

  if (maxQuantity !== undefined && maxQuantity <= 0) {
    return false;
  }

  saveCart([...cart, { ...product, quantity: 1 }]);
  return true;
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  const normalizedQuantity = Math.max(0, Math.floor(quantity));
  const cart = readCart();

  saveCart(
    cart
      .map((item) =>
        item.id === productId ? { ...item, quantity: normalizedQuantity } : item,
      )
      .filter((item) => item.quantity > 0),
  );
}

export function incrementCartItem(productId: string) {
  const cart = readCart();

  saveCart(
    cart.map((item) =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
    ),
  );
}

export function decrementCartItem(productId: string) {
  const cart = readCart();

  saveCart(
    cart
      .map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item,
      )
      .filter((item) => item.quantity > 0),
  );
}

export function removeCartItem(productId: string) {
  saveCart(readCart().filter((item) => item.id !== productId));
}

export function clearCart() {
  saveCart([]);
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
