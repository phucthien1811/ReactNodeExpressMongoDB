import { useState, useEffect, useCallback } from 'react';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

export const useOrders = (autoFetch = true) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { user } = useAuth();

  // Fetch orders
  const fetchOrders = useCallback(async (params = {}) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getMyOrders(params);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create order
  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.createOrder(orderData);
      // Refresh orders list
      await fetchOrders();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.cancelMyOrder(orderId);
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        )
      );
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch && user) {
      fetchOrders();
    }
  }, [autoFetch, user, fetchOrders]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    createOrder,
    cancelOrder,
    // Helper methods
    formatCurrency: orderService.formatCurrency,
    getStatusText: orderService.getStatusText,
    getStatusColor: orderService.getStatusColor
  };
};

export const useOrderDetails = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getMyOrderDetails(orderId);
      setOrder(response.data);
    } catch (err) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder
  };
};

// Hook for admin orders management
export const useAdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [statistics, setStatistics] = useState(null);

  // Fetch all orders (admin)
  const fetchAllOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getAllOrders(params);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, status, notes = '') => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status, notes);
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status, notes }
            : order
        )
      );
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update payment status
  const updatePaymentStatus = useCallback(async (orderId, paymentStatus) => {
    try {
      const response = await orderService.updatePaymentStatus(orderId, paymentStatus);
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, payment_status: paymentStatus }
            : order
        )
      );
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await orderService.getOrderStatistics();
      setStatistics(response.data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    pagination,
    statistics,
    fetchAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    fetchStatistics
  };
};