import orderService from '../services/order.service.js';
import { successResponse, errorResponse } from '../utils/resonse.js';

class OrderController {
  // Tạo đơn hàng mới
  async createOrder(req, res) {
    try {
      console.log('🔍 req.user in createOrder:', req.user);
      
      const userId = req.user.id || req.user.sub;
      console.log('🔍 Extracted userId for order:', userId);
      
      if (!userId) {
        return errorResponse(res, 'User ID not found in token', 400);
      }
      
      const orderData = req.body;

      const result = await orderService.createOrderFromCart(userId, orderData);
      return successResponse(res, result.data, result.message, 201);
    } catch (error) {
      console.log('❌ createOrder error:', error.message);
      return errorResponse(res, error.message, 400);
    }
  }

  // Lấy đơn hàng của user hiện tại
  async getMyOrders(req, res) {
    try {
      console.log('🔍 req.user:', req.user);
      
      const userId = req.user.id || req.user.sub; // Try both id and sub
      console.log('🔍 Extracted userId:', userId);
      
      if (!userId) {
        return errorResponse(res, 'User ID not found in token', 400);
      }
      
      const { page, limit, status } = req.query;
      
      const filters = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      };
      
      if (status) {
        filters.status = status;
      }

      const result = await orderService.getUserOrders(userId, filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.log('❌ getMyOrders error:', error.message);
      return errorResponse(res, error.message, 400);
    }
  }

  // Lấy chi tiết đơn hàng của user
  async getMyOrderDetails(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const result = await orderService.getOrderDetails(orderId, userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Access denied') ? 403 : 400;
      return errorResponse(res, error.message, statusCode);
    }
  }

  // Lấy đơn hàng theo order number
  async getOrderByNumber(req, res) {
    try {
      const userId = req.user?.id; // Optional cho admin
      const { orderNumber } = req.params;

      const result = await orderService.getOrderByNumber(orderNumber, userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Access denied') ? 403 : 400;
      return errorResponse(res, error.message, statusCode);
    }
  }

  // Hủy đơn hàng
  async cancelMyOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const result = await orderService.cancelOrder(orderId, userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Access denied') ? 403 : 400;
      return errorResponse(res, error.message, statusCode);
    }
  }

  // === ADMIN ENDPOINTS ===

  // Lấy tất cả đơn hàng (Admin)
  async getAllOrders(req, res) {
    try {
      const { page, limit, status, search } = req.query;
      
      const filters = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      };
      
      if (status) filters.status = status;
      if (search) filters.search = search;

      const result = await orderService.getAllOrders(filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Lấy chi tiết đơn hàng (Admin)
  async getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;

      const result = await orderService.getOrderDetails(orderId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      return errorResponse(res, error.message, statusCode);
    }
  }

  // Cập nhật trạng thái đơn hàng (Admin)
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }

      const result = await orderService.updateOrderStatus(orderId, status, notes);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      return errorResponse(res, error.message, statusCode);
    }
  }

  // Cập nhật trạng thái thanh toán (Admin)
  async updatePaymentStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { payment_status } = req.body;

      if (!payment_status) {
        return errorResponse(res, 'Payment status is required', 400);
      }

      const result = await orderService.updatePaymentStatus(orderId, payment_status);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      return errorResponse(res, error.message, statusCode);
    }
  }

  // Thống kê đơn hàng (Admin)
  async getOrderStatistics(req, res) {
    try {
      const result = await orderService.getOrderStatistics();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Xóa đơn hàng (Admin)
  async deleteOrder(req, res) {
    try {
      const { orderId } = req.params;

      const result = await orderService.cancelOrder(orderId);
      return successResponse(res, null, 'Order deleted successfully');
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      return errorResponse(res, error.message, statusCode);
    }
  }

  // Xuất Excel danh sách đơn hàng (Admin)
  async exportOrdersToExcel(req, res) {
    try {
      const { status, search, startDate, endDate } = req.query;
      
      const filters = {
        status,
        search,
        startDate,
        endDate
      };

      const buffer = await orderService.exportOrdersToExcel(filters);
      
      // Set headers cho file Excel
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Don-Hang-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      return res.send(buffer);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Lấy thống kê đơn hàng
  async getOrderStats(req, res) {
    try {
      const result = await orderService.getOrderStats();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default new OrderController();