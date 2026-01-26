import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setItems(parsedCart);
      setSelectedItems(new Set(parsedCart.map(item => item.id)));
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      const newItem = { ...product, quantity: qty, selected: true };
      setSelectedItems(prev => new Set([...prev, product.id]));
      return [...prev, newItem];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => 
      prev.map((i) => i.id === productId ? { ...i, quantity } : i)
    );
  };

  const toggleSelectItem = (productId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    setSelectedItems(new Set(items.map(item => item.id)));
  };

  const deselectAllItems = () => {
    setSelectedItems(new Set());
  };

  const clearCart = () => {
    setItems([]);
    setSelectedItems(new Set());
  };

  const clearSelectedItems = () => {
    const remainingItems = items.filter(item => !selectedItems.has(item.id));
    setItems(remainingItems);
    setSelectedItems(new Set());
  };

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0), [items]);
  
  const selectedItemsArray = useMemo(() => 
    items.filter(item => selectedItems.has(item.id)), [items, selectedItems]);
  
  const selectedTotalItems = useMemo(() => 
    selectedItemsArray.reduce((s, i) => s + i.quantity, 0), [selectedItemsArray]);
  
  const selectedSubtotal = useMemo(() => 
    selectedItemsArray.reduce((s, i) => s + (i.price || 0) * i.quantity, 0), [selectedItemsArray]);

  const value = {
    items,
    selectedItems,
    selectedItemsArray,
    addItem,
    removeItem,
    updateQuantity,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    clearCart,
    clearSelectedItems,
    totalItems,
    subtotal,
    selectedTotalItems,
    selectedSubtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
