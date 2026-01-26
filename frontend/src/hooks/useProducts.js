import { useShop } from '../context/ShopContext';

export default function useProducts() {
  const { products, loading, fetchProducts } = useShop();
  return { products, loading, fetchProducts };
}
