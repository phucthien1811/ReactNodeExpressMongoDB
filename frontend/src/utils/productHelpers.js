export function findById(products, id) {
  return products.find((p) => p.id === id);
}

export function filterByCategory(products, categoryId) {
  return products.filter((p) => p.categoryId === categoryId);
}
