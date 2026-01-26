import React, { createContext, useContext, useEffect, useState } from 'react';

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // placeholder: replace with real API call
      await new Promise((r) => setTimeout(r, 500));
      setProducts([
        { id: '1', title: 'Product 1', price: 29.99 },
        { id: '2', title: 'Product 2', price: 49.99 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ShopContext.Provider value={{ products, loading, fetchProducts }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
};

export default ShopContext;
