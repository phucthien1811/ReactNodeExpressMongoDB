import { useCart as useCartContext } from '../context/CartContext';

export default function useCart() {
  return useCartContext();
}
