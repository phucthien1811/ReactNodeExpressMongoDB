// Order API service
import api from './api.js';

class OrderService {
  // Tạo đơn hàng từ giỏ hàng
  async createOrder(orderData) {
    try {
      console.log('🚀 Sending order data to:', '/orders');
      console.log('📦 Order data:', orderData);
      
      const response = await api.post('/orders', orderData);
      console.log('✅ Response from server:', response);
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Validation errors:', error.response?.data?.errors);
      console.error('❌ Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  }

  // Lấy danh sách đơn hàng của user
  async getMyOrders(params = {}) {
    try {
      const { page = 1, limit = 10, status } = params;
      let url = `/orders/my-orders?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đơn hàng');
    }
  }

  // Lấy chi tiết đơn hàng
  async getMyOrderDetails(orderId) {
    try {
      const response = await api.get(`/orders/my-orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy chi tiết đơn hàng');
    }
  }

  // Hủy đơn hàng
  async cancelMyOrder(orderId) {
    try {
      const response = await api.patch(`/orders/my-orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  }

  // Tìm đơn hàng theo số đơn hàng
  async getOrderByNumber(orderNumber) {
    try {
      const response = await api.get(`/orders/number/${orderNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không tìm thấy đơn hàng');
    }
  }

  // === ADMIN METHODS ===
  
  // Admin: Lấy tất cả đơn hàng
  async getAllOrders(params = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        payment_status, 
        search, 
        sort_by = 'created_at',
        sort_order = 'desc' 
      } = params;
      
      let url = `/orders/admin?page=${page}&limit=${limit}&sort_by=${sort_by}&sort_order=${sort_order}`;
      if (status) url += `&status=${status}`;
      if (payment_status) url += `&payment_status=${payment_status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đơn hàng');
    }
  }

  // Admin: Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const response = await api.patch(`/orders/admin/${orderId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
    }
  }

  // Admin: Cập nhật trạng thái thanh toán
  async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const response = await api.patch(`/orders/admin/${orderId}/payment`, {
        payment_status: paymentStatus
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán');
    }
  }

  // Admin: Thống kê đơn hàng
  async getOrderStatistics() {
    try {
      const response = await api.get('/orders/admin/statistics');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thống kê đơn hàng');
    }
  }

  // Helper methods
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  getStatusText(status) {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'processing': 'Đang xử lý',
      'shipped': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status) {
    const colorMap = {
      'pending': '#ffc107',
      'confirmed': '#17a2b8',
      'processing': '#007bff',
      'shipped': '#fd7e14',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    return colorMap[status] || '#6c757d';
  }
}

const orderService = new OrderService();
export default orderService;