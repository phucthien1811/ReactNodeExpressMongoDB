import express from 'express';
import voucherController from '../controllers/voucher.controller.js';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

// Public route - Áp dụng voucher tại checkout
router.post('/apply', auth, voucherController.applyVoucher);

// Public route - Sử dụng voucher (tăng used_count sau khi thanh toán)
router.post('/:id/use', auth, voucherController.useVoucher);

// Admin routes - Quản lý vouchers
router.post('/', auth, authorizeRoles(['admin']), voucherController.createVoucher);
router.get('/', auth, authorizeRoles(['admin']), voucherController.getVouchers);
router.get('/:id', auth, authorizeRoles(['admin']), voucherController.getVoucherById);
router.put('/:id', auth, authorizeRoles(['admin']), voucherController.updateVoucher);
router.delete('/:id', auth, authorizeRoles(['admin']), voucherController.deleteVoucher);
router.patch('/:id/status', auth, authorizeRoles(['admin']), voucherController.toggleVoucherStatus);

export default router;
