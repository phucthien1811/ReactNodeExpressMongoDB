import express from 'express';
import userController from '../handlers/user.handler.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../validations/user.js';

const router = express.Router();

// Tất cả routes đều yêu cầu auth và role admin
router.use(auth);
router.use(requireAdmin);

// GET /api/v1/users/stats - Lấy thống kê
router.get('/stats', userController.getStats);

// GET /api/v1/users/export - Export users to Excel (phải đặt trước /:id)
router.get('/export', userController.exportUsers);

// GET /api/v1/users/:id/transactions/export - Export giao dịch của user (phải đặt trước /:id)
router.get('/:id/transactions/export', userController.exportUserTransactions);

// GET /api/v1/users/:id/detail - Lấy chi tiết đầy đủ member (profile + packages)
router.get('/:id/detail', userController.getMemberDetail);

// GET /api/v1/users - Lấy danh sách users
router.get('/', userController.getUsers);

// GET /api/v1/users/:id - Lấy chi tiết user
router.get('/:id', userController.getUserById);

// POST /api/v1/users - Tạo user mới
router.post('/', validate(createUserSchema), userController.createUser);

// PUT /api/v1/users/:id - Cập nhật user
router.put('/:id', validate(updateUserSchema), userController.updateUser);

// PATCH /api/v1/users/:id/toggle-status - Toggle trạng thái
router.patch('/:id/toggle-status', userController.toggleStatus);

// DELETE /api/v1/users/:id - Xóa user
router.delete('/:id', userController.deleteUser);

export default router;
