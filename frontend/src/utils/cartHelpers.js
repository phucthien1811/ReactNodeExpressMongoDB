export function addToCart(items, product, qty = 1) {
  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    return items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
  }
  return [...items, { ...product, quantity: qty }];
}

export function removeFromCart(items, productId) {
  return items.filter((i) => i.id !== productId);
}

export function cartTotal(items) {
  return items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
}
