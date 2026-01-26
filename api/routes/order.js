import express from 'express';
import orderController from '../controllers/order.controller.js';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import { 
  validateCreateOrder, 
  validateUpdateOrderStatus, 
  validateUpdatePaymentStatus,
  validateOrderQuery 
} from '../validations/order.js';

const router = express.Router();

// === USER ROUTES ===
// Tạo đơn hàng mới
router.post('/', 
  auth, 
  validateCreateOrder, 
  orderController.createOrder
);

// Lấy đơn hàng của user hiện tại
router.get('/my-orders', 
  auth, 
  validateOrderQuery, 
  orderController.getMyOrders
);

// Lấy chi tiết đơn hàng của user
router.get('/my-orders/:orderId', auth, orderController.getMyOrderDetails);

// Hủy đơn hàng
router.patch('/my-orders/:orderId/cancel', auth, orderController.cancelMyOrder);

// Lấy đơn hàng theo order number (public với auth)
router.get('/number/:orderNumber', auth, orderController.getOrderByNumber);

// === ADMIN ROUTES ===
// Lấy thống kê đơn hàng
router.get('/admin/stats',
  auth,
  authorizeRoles(['admin']),
  orderController.getOrderStats
);

// Lấy tất cả đơn hàng
router.get('/admin/all', 
  auth, 
  authorizeRoles(['admin']), 
  validateOrderQuery,
  orderController.getAllOrders
);

// Xuất Excel danh sách đơn hàng
router.get('/admin/export-excel',
  auth,
  authorizeRoles(['admin']),
  orderController.exportOrdersToExcel
);

// Lấy chi tiết đơn hàng (admin)
router.get('/admin/:orderId', 
  auth, 
  authorizeRoles(['admin']), 
  orderController.getOrderDetails
);

// Cập nhật trạng thái đơn hàng
router.patch('/admin/:orderId/status', 
  auth, 
  authorizeRoles(['admin']), 
  validateUpdateOrderStatus,
  orderController.updateOrderStatus
);

// Cập nhật trạng thái thanh toán
router.patch('/admin/:orderId/payment', 
  auth, 
  authorizeRoles(['admin']), 
  validateUpdatePaymentStatus,
  orderController.updatePaymentStatus
);

// Thống kê đơn hàng
router.get('/admin/statistics', 
  auth, 
  authorizeRoles(['admin']), 
  orderController.getOrderStatistics
);

// Xóa đơn hàng
router.delete('/admin/:orderId', 
  auth, 
  authorizeRoles(['admin']), 
  orderController.deleteOrder
);

export default router;