import express from 'express';
import trainerController from '../controllers/trainer.js';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

// Tất cả route trainer đều yêu cầu admin role
router.use(auth);
router.use(authorizeRoles(['admin']));

// GET /api/v1/trainers/stats - Lấy thống kê (đặt trước route :id)
router.get('/stats', trainerController.getTrainerStats);

// GET /api/v1/trainers - Lấy danh sách trainers
router.get('/', trainerController.getAllTrainers);

// GET /api/v1/trainers/:id - Lấy thông tin trainer theo ID
router.get('/:id', trainerController.getTrainerById);

// POST /api/v1/trainers - Tạo trainer mới
router.post('/', trainerController.createTrainer);

// PUT /api/v1/trainers/:id - Cập nhật trainer
router.put('/:id', trainerController.updateTrainer);

// PATCH /api/v1/trainers/:id/status - Cập nhật trạng thái trainer
router.patch('/:id/status', trainerController.updateTrainerStatus);

// DELETE /api/v1/trainers/:id - Xóa trainer
router.delete('/:id', trainerController.deleteTrainer);

export default router;
