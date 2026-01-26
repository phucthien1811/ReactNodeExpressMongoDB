// File: api/routes/payment.js

import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/v1/payment/mock-transfer
 * @desc    Mock bank transfer - Giả lập chuyển khoản (cho demo)
 * @access  Private
 */
router.post('/mock-transfer', auth, paymentController.mockBankTransfer);

/**
 * @route   GET /api/v1/payment/transactions
 * @desc    Lấy lịch sử giao dịch của user
 * @access  Private
 * @query   { type, status, startDate, endDate, page, limit }
 */
router.get('/transactions', auth, paymentController.getTransactionHistory);

/**
 * @route   GET /api/v1/payment/transactions/export
 * @desc    Xuất lịch sử giao dịch ra Excel
 * @access  Private
 * @query   { type, status, startDate, endDate }
 */
router.get('/transactions/export', auth, paymentController.exportTransactionsToExcel);

/**
 * @route   POST /api/payment/create-payment-url
 * @desc    Tạo URL thanh toán VNPAY
 * @access  Private (yêu cầu đăng nhập)
 * @body    { amount, orderDescription, orderType, language, bankCode }
 */
router.post('/create-payment-url', auth, paymentController.createPaymentUrl);

/**
 * @route   GET /api/payment/vnpay-return
 * @desc    Callback URL - VNPAY redirect user về đây sau khi thanh toán
 * @access  Public
 * @query   vnp_* params từ VNPAY
 */
router.get('/vnpay-return', paymentController.vnpayReturn);

/**
 * @route   GET /api/payment/vnpay-ipn
 * @desc    IPN URL - VNPAY gọi về để xác nhận transaction
 * @access  Public
 * @query   vnp_* params từ VNPAY
 */
router.get('/vnpay-ipn', paymentController.vnpayIPN);

// Debug route to inspect sign variants (useful for diagnosing signature mismatches)
router.get('/debug-sign', paymentController.debugSign);

export default router;
