import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

// Admin only - Lấy thống kê dashboard
router.get('/stats',
  auth,
  authorizeRoles(['admin']),
  dashboardController.getDashboardStats
);

export default router;
