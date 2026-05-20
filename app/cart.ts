import {
  getCartItemId,
  getProductPackageSize,
  getProductPrice,
  parseCartItemId,
  type PricingTier,
  type Product,
  type ProductPackageType,
} from "./products";

export const cartStorageKey = "ecw-cart-v1";
export const cartUpdatedEvent = "ecw-cart-updated";

export type CartItem = Product & {
  productId: string;
  packageType: ProductPackageType;
  packageSize: number;
  price: number;
  quantity: number;
};

export function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem(cartStorageKey);
    const items = storedCart ? (JSON.parse(storedCart) as CartItem[]) : [];

    return items.map((item) => {
      const parsed = parseCartItemId(item.id);
      const packageType = item.packageType ?? parsed.packageType;

      return {
        ...item,
        productId: item.productId ?? parsed.productId,
        packageType,
        packageSize: item.packageSize ?? getProductPackageSize(packageType),
      };
    });
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

export function addProductToCart(
  product: Product,
  pricingTier: PricingTier,
  packageType: ProductPackageType,
  maxQuantity?: number,
) {
  const cart = readCart();
  const cartItemId = getCartItemId(product.id, packageType);
  const existingItem = cart.find((item) => item.id === cartItemId);
  const packageSize = getProductPackageSize(packageType);
  const price = getProductPrice(product, pricingTier, packageType);

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

  saveCart([
    ...cart,
    {
      ...product,
      id: cartItemId,
      productId: product.id,
      packageType,
      packageSize,
      price,
      quantity: 1,
    },
  ]);
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

export function getCartItemPrice(item: CartItem, pricingTier?: PricingTier) {
  if (
    pricingTier === undefined ||
    item.retailVialPrice === undefined ||
    item.memberVialPrice === undefined
  ) {
    return item.price;
  }

  return getProductPrice(item, pricingTier, item.packageType);
}

export function getCartTotal(items: CartItem[], pricingTier?: PricingTier) {
  return items.reduce(
    (total, item) => total + getCartItemPrice(item, pricingTier) * item.quantity,
    0,
  );
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
