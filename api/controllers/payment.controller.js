// File: api/controllers/payment.controller.js

import VNPayHelper from '../utils/vnpay.helper.js';
import vnpayConfig from '../config/vnpay.config.js';
import moment from 'moment';
import orderService from '../services/order.service.js';
import { memberPackageService } from '../services/member-package.service.js';
import invoiceService from '../services/invoice.service.js';
import db from '../config/knex.js';
import { exportToExcel } from '../utils/excelExporter.js';

// Helper function: Loại bỏ dấu tiếng Việt
function removeVietnameseTones(str) {
  return str
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
    .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
    .replace(/[ÌÍỊỈĨ]/g, 'I')
    .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
    .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
    .replace(/[ỲÝỴỶỸ]/g, 'Y')
    .replace(/Đ/g, 'D');
}

class PaymentController {
  /**
   * Tạo URL thanh toán VNPAY
   * POST /api/v1/payment/create-payment-url
   * Body: { 
   *   type: 'order' | 'package',  // Loại thanh toán
   *   orderId: number,             // ID đơn hàng (nếu type = 'order')
   *   packageId: number,           // ID gói tập (nếu type = 'package')
   *   amount: number,
   *   bankCode: string (optional)
   * }
   */
  /**
   * Mock Bank Transfer - Giả lập chuyển khoản ngân hàng
   * POST /api/v1/payment/mock-transfer
   * Body: { type, orderId/packageId, amount, accountFrom, accountTo }
   */
  async mockBankTransfer(req, res) {
    try {
      const userId = req.user.id || req.user.sub;
      const { type, orderId, packageId, amount, accountFrom, accountTo } = req.body;

      // Debug log
      console.log('🔍 Mock transfer request:', {
        userId,
        type,
        orderId,
        packageId,
        amount,
        accountFrom,
        accountTo
      });

      // Validate
      if (!type || !['order', 'package'].includes(type)) {
        console.log('❌ Invalid type:', type);
        return res.status(400).json({
          success: false,
          message: 'Loại thanh toán không hợp lệ'
        });
      }

      if (!amount || amount <= 0) {
        console.log('❌ Invalid amount:', amount);
        return res.status(400).json({
          success: false,
          message: 'Số tiền không hợp lệ'
        });
      }

      // Validate orderId hoặc packageId
      if (type === 'order' && !orderId) {
        console.log('❌ Missing orderId');
        return res.status(400).json({
          success: false,
          message: 'Order ID là bắt buộc'
        });
      }

      if (type === 'package' && !packageId) {
        console.log('❌ Missing packageId');
        return res.status(400).json({
          success: false,
          message: 'Package ID là bắt buộc'
        });
      }

      // Tạo transaction ID giả lập
      const txnRef = 'MOCK' + moment().format('DDHHmmss');
      const transactionNo = 'TXN' + Date.now();

      // Lưu vào DB
      await db('payment_transactions').insert({
        txn_ref: txnRef,
        user_id: userId,
        type: type,
        order_id: type === 'order' ? orderId : null,
        package_id: type === 'package' ? packageId : null,
        amount: amount,
        status: 'pending',
        transaction_no: transactionNo,
        bank_code: 'MOCK_BANK',
        created_at: new Date()
      });

      // Giả lập delay (như thật)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Giả lập thành công (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        // Cập nhật transaction thành công
        await db('payment_transactions')
          .where('txn_ref', txnRef)
          .update({
            status: 'success',
            pay_date: moment().format('YYYYMMDDHHmmss'),
            response_code: '00',
            updated_at: new Date()
          });

        // Xử lý theo loại thanh toán
        if (type === 'order') {
          // Cập nhật order
          await db('orders')
            .where('id', orderId)
            .update({
              payment_status: 'paid',
              updated_at: new Date()
            });

          // Cập nhật invoice (sử dụng source_type và source_id)
          await db('invoices')
            .where('source_type', 'shop_order')
            .where('source_id', orderId)
            .update({
              payment_status: 'paid',
              amount_paid: amount,
              paid_at: new Date(),
              updated_at: new Date()
            });

          console.log(`✅ Mock payment: Đơn hàng #${orderId} đã thanh toán`);

        } else if (type === 'package') {
          // Kích hoạt gói tập
          await memberPackageService.registerPackage(
            userId,
            packageId,
            amount,
            `Mock Bank Transfer - TXN: ${transactionNo}`
          );

          console.log(`✅ Mock payment: Gói tập #${packageId} đã kích hoạt`);
        }

        return res.json({
          success: true,
          message: 'Chuyển khoản thành công',
          data: {
            txnRef,
            transactionNo,
            amount,
            accountFrom,
            accountTo,
            timestamp: new Date().toISOString(),
            type
          }
        });

      } else {
        // Giả lập thất bại
        await db('payment_transactions')
          .where('txn_ref', txnRef)
          .update({
            status: 'failed',
            response_code: '99',
            updated_at: new Date()
          });

        return res.status(400).json({
          success: false,
          message: 'Giao dịch thất bại. Vui lòng thử lại.',
          data: { txnRef, transactionNo }
        });
      }

    } catch (error) {
      console.error('Error mock bank transfer:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi xử lý giao dịch',
        error: error.message
      });
    }
  }

  async createPaymentUrl(req, res) {
    try {
      const userId = req.user.id || req.user.sub;
      
      // Lấy IP address của user - fix để đảm bảo format đúng
      let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
        '127.0.0.1';
      
      // Nếu IP là IPv6 localhost, chuyển sang IPv4
      if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
        ipAddr = '127.0.0.1';
      }
      
      // Lấy IP đầu tiên nếu có nhiều IP (x-forwarded-for)
      if (ipAddr.includes(',')) {
        ipAddr = ipAddr.split(',')[0].trim();
      }
      
      // Remove IPv6 prefix if exists
      ipAddr = ipAddr.replace('::ffff:', '');
      
      console.log('🌐 Client IP:', ipAddr);

      // Tạo mã giao dịch unique (format: DDHHmmss)
      const txnRef = moment().format('DDHHmmss');
      
      const { type, orderId, packageId, amount, bankCode } = req.body;

      // Validate
      if (!type || !['order', 'package'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Loại thanh toán không hợp lệ (order hoặc package)'
        });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Số tiền không hợp lệ'
        });
      }

      let orderDescription = '';
      let orderData = null;

      // Xử lý theo loại thanh toán
      if (type === 'order') {
        // Thanh toán đơn hàng sản phẩm
        if (!orderId) {
          return res.status(400).json({
            success: false,
            message: 'Order ID là bắt buộc'
          });
        }

        // Kiểm tra order tồn tại và thuộc về user
        const orderResult = await orderService.getOrderDetails(orderId, userId);
        orderData = orderResult.data;

        if (orderData.payment_status === 'paid') {
          return res.status(400).json({
            success: false,
            message: 'Đơn hàng này đã được thanh toán'
          });
        }

        // Loại bỏ dấu tiếng Việt vì VNPAY không chấp nhận
        orderDescription = removeVietnameseTones(`Thanh toan don hang ${orderData.order_number}`);

        // Lưu thông tin giao dịch vào DB
        await db('payment_transactions').insert({
          txn_ref: txnRef,
          user_id: userId,
          type: 'order',
          order_id: orderId,
          amount: amount,
          status: 'pending',
          created_at: new Date()
        });

      } else if (type === 'package') {
        // Thanh toán gói tập
        if (!packageId) {
          return res.status(400).json({
            success: false,
            message: 'Package ID là bắt buộc'
          });
        }

        // Kiểm tra package tồn tại
        const packageData = await db('packages').where('id', packageId).first();
        if (!packageData) {
          return res.status(400).json({
            success: false,
            message: 'Gói tập không tồn tại'
          });
        }

        // Loại bỏ dấu tiếng Việt
        orderDescription = removeVietnameseTones(`Thanh toan goi tap ${packageData.name}`);

        // Lưu thông tin giao dịch vào DB
        await db('payment_transactions').insert({
          txn_ref: txnRef,
          user_id: userId,
          type: 'package',
          package_id: packageId,
          amount: amount,
          status: 'pending',
          created_at: new Date()
        });
      }

      // Tạo params cho VNPAY
      const params = {
        orderId: txnRef,
        amount: amount,
        orderDescription: orderDescription,
        orderType: type === 'order' ? 'billpayment' : 'other',
        language: 'vn',
        ipAddr: ipAddr // Đã được fix ở trên
      };
      
      // Chỉ thêm bankCode nếu có giá trị
      if (bankCode) {
        params.bankCode = bankCode;
      }

      console.log('🔍 VNPAY params:', params);
      console.log('🌐 Final IP for VNPAY:', ipAddr);

      // Tạo URL thanh toán
      const paymentUrl = VNPayHelper.createPaymentUrl(vnpayConfig, params);
      
      console.log('💳 Payment URL created:', paymentUrl);

      // Trả về URL thanh toán cho frontend
      res.json({
        success: true,
        message: 'Tạo URL thanh toán thành công',
        data: {
          paymentUrl,
          txnRef,
          amount
        }
      });
    } catch (error) {
      console.error('Error creating payment URL:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi tạo URL thanh toán',
        error: error.message
      });
    }
  }

  /**
   * Debug endpoint to show signature variants and payment URL variants.
   * GET /api/v1/payment/debug-sign
   * Query: amount, orderId, orderDescription, orderType, language, ipAddr, bankCode
   */
  async debugSign(req, res) {
    try {
      const { orderId = moment().format('DDHHmmss'), amount = 0, orderDescription = 'Test thanh toan', orderType = 'other', language = 'vn', ipAddr = '127.0.0.1', bankCode } = req.query;

      // Build vnp params similar to createPaymentUrl
      let vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = vnpayConfig.vnp_TmnCode;
      vnp_Params['vnp_Locale'] = language || 'vn';
      vnp_Params['vnp_CurrCode'] = 'VND';
      vnp_Params['vnp_TxnRef'] = String(orderId);
      vnp_Params['vnp_OrderInfo'] = orderDescription;
      vnp_Params['vnp_OrderType'] = orderType || 'other';
      vnp_Params['vnp_Amount'] = String(Math.round((Number(amount) || 0) * 100));
      vnp_Params['vnp_ReturnUrl'] = vnpayConfig.vnp_ReturnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = moment().format('YYYYMMDDHHmmss');
      if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

      // Sort keys
      vnp_Params = VNPayHelper.sortObject(vnp_Params);

      // Variant 1: raw sign string (key=value&... no encoding)
      const signArrayRaw = [];
      for (let key in vnp_Params) {
        if (vnp_Params[key] !== '' && vnp_Params[key] !== undefined && vnp_Params[key] !== null) {
          signArrayRaw.push(`${key}=${vnp_Params[key]}`);
        }
      }
      const signRaw = signArrayRaw.join('&');
      const hashRaw = require('crypto').createHmac('sha512', vnpayConfig.vnp_HashSecret).update(Buffer.from(signRaw, 'utf-8')).digest('hex');

      // Variant 2: urlencode keys and values before hash (some implementations do this)
      const signArrayUrl = [];
      for (let key in vnp_Params) {
        if (vnp_Params[key] !== '' && vnp_Params[key] !== undefined && vnp_Params[key] !== null) {
          signArrayUrl.push(encodeURIComponent(key) + '=' + encodeURIComponent(vnp_Params[key]));
        }
      }
      const signUrlEncoded = signArrayUrl.join('&');
      const hashUrlEncoded = require('crypto').createHmac('sha512', vnpayConfig.vnp_HashSecret).update(Buffer.from(signUrlEncoded, 'utf-8')).digest('hex');

      // Uppercase variant
      const hashRawUpper = hashRaw.toUpperCase();

      // Build URL-encoded query base (for redirect)
      const queryArray = [];
      for (let key in vnp_Params) {
        if (vnp_Params[key] !== '' && vnp_Params[key] !== undefined && vnp_Params[key] !== null) {
          queryArray.push(encodeURIComponent(key) + '=' + encodeURIComponent(vnp_Params[key]));
        }
      }

      const baseQuery = queryArray.join('&');

      const paymentUrl_raw = `${vnpayConfig.vnp_Url}?${baseQuery}&vnp_SecureHash=${encodeURIComponent(hashRaw)}&vnp_SecureHashType=SHA512`;
      const paymentUrl_raw_upper = `${vnpayConfig.vnp_Url}?${baseQuery}&vnp_SecureHash=${encodeURIComponent(hashRawUpper)}&vnp_SecureHashType=SHA512`;
      const paymentUrl_urlencodedhash = `${vnpayConfig.vnp_Url}?${baseQuery}&vnp_SecureHash=${encodeURIComponent(hashUrlEncoded)}&vnp_SecureHashType=SHA512`;

      return res.json({
        success: true,
        data: {
          vnp_Params,
          signRaw,
          hashRaw,
          hashRawUpper,
          signUrlEncoded,
          hashUrlEncoded,
          paymentUrl_raw,
          paymentUrl_raw_upper,
          paymentUrl_urlencodedhash
        }
      });
    } catch (error) {
      console.error('Error debugSign:', error);
      return res.status(500).json({ success: false, message: 'Error generating debug sign', error: error.message });
    }
  }

  /**
   * Xử lý callback từ VNPAY khi user thanh toán xong
   * GET /api/v1/payment/vnpay-return
   */
  async vnpayReturn(req, res) {
    try {
      let vnp_Params = req.query;
      const secureHash = vnp_Params['vnp_SecureHash'];

      // Xác thực chữ ký
      const isValid = VNPayHelper.verifyReturnUrl(
        { ...vnp_Params },
        secureHash,
        vnpayConfig.vnp_HashSecret
      );

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Chữ ký không hợp lệ'
        });
      }

      // Lấy thông tin từ response
      const txnRef = vnp_Params['vnp_TxnRef'];
      const amount = vnp_Params['vnp_Amount'] / 100; // Chia 100 vì VNPAY trả về x100
      const responseCode = vnp_Params['vnp_ResponseCode'];
      const transactionNo = vnp_Params['vnp_TransactionNo'];
      const bankCode = vnp_Params['vnp_BankCode'];
      const payDate = vnp_Params['vnp_PayDate'];

      // Lấy thông tin transaction từ DB
      const transaction = await db('payment_transactions')
        .where('txn_ref', txnRef)
        .first();

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy giao dịch'
        });
      }

      // Kiểm tra trạng thái thanh toán
      if (responseCode === '00') {
        // ✅ Thanh toán thành công
        
        // Cập nhật trạng thái transaction
        await db('payment_transactions')
          .where('txn_ref', txnRef)
          .update({
            status: 'success',
            transaction_no: transactionNo,
            bank_code: bankCode,
            pay_date: payDate,
            response_code: responseCode,
            updated_at: new Date()
          });

        // Xử lý theo loại thanh toán
        if (transaction.type === 'order') {
          // Cập nhật trạng thái đơn hàng
          await db('orders')
            .where('id', transaction.order_id)
            .update({
              payment_status: 'paid',
              updated_at: new Date()
            });

          // Cập nhật invoice (sử dụng source_type và source_id)
          await db('invoices')
            .where('source_type', 'shop_order')
            .where('source_id', transaction.order_id)
            .update({
              payment_status: 'paid',
              amount_paid: amount,
              paid_at: new Date(),
              updated_at: new Date()
            });

          console.log(`✅ Đơn hàng #${transaction.order_id} đã thanh toán thành công`);

        } else if (transaction.type === 'package') {
          // Active gói tập cho user
          try {
            await memberPackageService.registerPackage(
              transaction.user_id,
              transaction.package_id,
              amount,
              `Thanh toán qua VNPAY - Mã GD: ${transactionNo}`
            );

            console.log(`✅ Gói tập #${transaction.package_id} đã được kích hoạt cho user #${transaction.user_id}`);
          } catch (error) {
            console.error('❌ Lỗi khi kích hoạt gói tập:', error.message);
          }
        }

        return res.json({
          success: true,
          message: 'Thanh toán thành công',
          data: {
            txnRef,
            amount,
            transactionNo,
            bankCode,
            payDate,
            type: transaction.type
          }
        });
      } else {
        // ❌ Thanh toán thất bại
        const errorMessage = VNPayHelper.getResponseMessage(responseCode);
        
        // Cập nhật trạng thái transaction
        await db('payment_transactions')
          .where('txn_ref', txnRef)
          .update({
            status: 'failed',
            response_code: responseCode,
            updated_at: new Date()
          });

        // Cập nhật order nếu là thanh toán đơn hàng
        if (transaction.type === 'order') {
          await db('orders')
            .where('id', transaction.order_id)
            .update({
              payment_status: 'failed',
              updated_at: new Date()
            });
        }

        return res.json({
          success: false,
          message: errorMessage,
          data: {
            txnRef,
            responseCode
          }
        });
      }
    } catch (error) {
      console.error('Error processing VNPAY return:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi xử lý callback thanh toán',
        error: error.message
      });
    }
  }

  /**
   * IPN URL - VNPAY gọi về để confirm transaction
   * GET /api/v1/payment/vnpay-ipn
   */
  async vnpayIPN(req, res) {
    try {
      let vnp_Params = req.query;
      const secureHash = vnp_Params['vnp_SecureHash'];

      // Xác thực chữ ký
      const isValid = VNPayHelper.verifyReturnUrl(
        { ...vnp_Params },
        secureHash,
        vnpayConfig.vnp_HashSecret
      );

      if (!isValid) {
        return res.json({
          RspCode: '97',
          Message: 'Invalid signature'
        });
      }

      const txnRef = vnp_Params['vnp_TxnRef'];
      const amount = vnp_Params['vnp_Amount'] / 100;
      const responseCode = vnp_Params['vnp_ResponseCode'];

      // Kiểm tra transaction có tồn tại trong DB không
      const transaction = await db('payment_transactions')
        .where('txn_ref', txnRef)
        .first();

      if (!transaction) {
        return res.json({ 
          RspCode: '01', 
          Message: 'Transaction not found' 
        });
      }

      // Kiểm tra số tiền có khớp không
      if (transaction.amount !== amount) {
        return res.json({ 
          RspCode: '04', 
          Message: 'Invalid amount' 
        });
      }

      // Kiểm tra trạng thái (tránh xử lý trùng)
      if (transaction.status === 'success') {
        return res.json({ 
          RspCode: '02', 
          Message: 'Transaction already confirmed' 
        });
      }

      if (responseCode === '00') {
        // Thanh toán thành công
        console.log(`✅ IPN: Transaction ${txnRef} - Payment successful - Amount: ${amount}`);
        
        return res.json({
          RspCode: '00',
          Message: 'Confirm Success'
        });
      } else {
        // Thanh toán thất bại
        console.log(`❌ IPN: Transaction ${txnRef} - Payment failed - Code: ${responseCode}`);
        
        return res.json({
          RspCode: '00',
          Message: 'Confirm Success'
        });
      }
    } catch (error) {
      console.error('Error processing VNPAY IPN:', error);
      return res.json({
        RspCode: '99',
        Message: 'Unknown error'
      });
    }
  }

  /**
   * Lấy lịch sử giao dịch của user
   * GET /api/v1/payment/transactions
   * Query: { type, status, startDate, endDate, page, limit }
   */
  async getTransactionHistory(req, res) {
    try {
      const userId = req.user.id || req.user.sub;
      const { type, status, startDate, endDate, page = 1, limit = 20 } = req.query;

      console.log('📊 Getting transaction history for user:', userId);

      // Build query
      let query = db('payment_transactions')
        .where('user_id', userId)
        .orderBy('created_at', 'desc');

      // Filter by type
      if (type && ['order', 'package'].includes(type)) {
        query = query.where('type', type);
      }

      // Filter by status
      if (status && ['pending', 'success', 'failed'].includes(status)) {
        query = query.where('status', status);
      }

      // Filter by date range
      if (startDate) {
        query = query.where('created_at', '>=', new Date(startDate));
      }
      if (endDate) {
        query = query.where('created_at', '<=', new Date(endDate));
      }

      // Pagination
      const offset = (page - 1) * limit;
      const transactions = await query.limit(limit).offset(offset);

      // Get total count
      const countQuery = db('payment_transactions')
        .where('user_id', userId)
        .count('* as total')
        .first();
      
      if (type) countQuery.where('type', type);
      if (status) countQuery.where('status', status);
      if (startDate) countQuery.where('created_at', '>=', new Date(startDate));
      if (endDate) countQuery.where('created_at', '<=', new Date(endDate));

      const { total } = await countQuery;

      // Enrich data with related info
      const enrichedTransactions = await Promise.all(
        transactions.map(async (trx) => {
          let description = '';
          let relatedData = null;

          if (trx.type === 'order' && trx.order_id) {
            const order = await db('orders')
              .where('id', trx.order_id)
              .first();
            if (order) {
              description = `Đơn hàng #${order.order_number}`;
              relatedData = { orderNumber: order.order_number };
            }
          } else if (trx.type === 'package' && trx.package_id) {
            const pkg = await db('packages')
              .where('id', trx.package_id)
              .first();
            if (pkg) {
              description = `Gói tập: ${pkg.name}`;
              relatedData = { packageName: pkg.name };
            }
          }

          return {
            id: trx.id,
            txnRef: trx.txn_ref,
            transactionNo: trx.transaction_no,
            type: trx.type,
            typeLabel: trx.type === 'order' ? 'Mua hàng' : 'Gói tập',
            amount: parseFloat(trx.amount),
            status: trx.status,
            statusLabel: {
              pending: 'Đang xử lý',
              success: 'Thành công',
              failed: 'Thất bại'
            }[trx.status] || trx.status,
            bankCode: trx.bank_code === 'MOCK_BANK' ? 'Chuyển khoản' : (trx.bank_code || '-'),
            description,
            relatedData,
            payDate: trx.pay_date,
            createdAt: trx.created_at,
            updatedAt: trx.updated_at
          };
        })
      );

      return res.json({
        success: true,
        data: {
          transactions: enrichedTransactions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(total),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy lịch sử giao dịch',
        error: error.message
      });
    }
  }

  /**
   * Xuất lịch sử giao dịch ra Excel
   * GET /api/v1/payment/transactions/export
   * Query: { type, status, startDate, endDate }
   */
  async exportTransactionsToExcel(req, res) {
    try {
      const userId = req.user.id || req.user.sub;
      const { type, status, startDate, endDate } = req.query;

      console.log('📊 Exporting transactions to Excel for user:', userId);

      // Build query
      let query = db('payment_transactions')
        .where('user_id', userId)
        .orderBy('created_at', 'desc');

      // Apply filters
      if (type && ['order', 'package'].includes(type)) {
        query = query.where('type', type);
      }
      if (status && ['pending', 'success', 'failed'].includes(status)) {
        query = query.where('status', status);
      }
      if (startDate) {
        query = query.where('created_at', '>=', new Date(startDate));
      }
      if (endDate) {
        query = query.where('created_at', '<=', new Date(endDate));
      }

      const transactions = await query;

      // Enrich data
      const enrichedTransactions = await Promise.all(
        transactions.map(async (trx) => {
          let description = '';
          if (trx.type === 'order' && trx.order_id) {
            const order = await db('orders').where('id', trx.order_id).first();
            if (order) description = `Đơn hàng #${order.order_number}`;
          } else if (trx.type === 'package' && trx.package_id) {
            const pkg = await db('packages').where('id', trx.package_id).first();
            if (pkg) description = `Gói tập: ${pkg.name}`;
          }

          return {
            txnRef: trx.txn_ref,
            transactionNo: trx.transaction_no || '-',
            createdAt: moment(trx.created_at).format('DD/MM/YYYY HH:mm'),
            type: trx.type === 'order' ? 'Mua hàng' : 'Gói tập',
            description: description || '-',
            amount: `${parseFloat(trx.amount).toLocaleString('vi-VN')}đ`,
            status: {
              pending: 'Đang xử lý',
              success: 'Thành công',
              failed: 'Thất bại'
            }[trx.status] || trx.status,
            bankCode: trx.bank_code === 'MOCK_BANK' ? 'Chuyển khoản' : (trx.bank_code || '-'),
            payDate: trx.pay_date ? moment(trx.pay_date, 'YYYYMMDDHHmmss').format('DD/MM/YYYY HH:mm') : '-'
          };
        })
      );

      // Prepare Excel config
      const excelConfig = {
        fileName: `Lich_su_giao_dich_${moment().format('DDMMYYYY_HHmmss')}.xlsx`,
        sheetName: 'Lịch sử giao dịch',
        headers: [
          { type: 'title', value: 'LỊCH SỬ GIAO DỊCH - VNSHOP GYM' },
          { type: 'empty' },
          { type: 'info', value: `Thời gian xuất: ${moment().format('DD/MM/YYYY HH:mm:ss')}` },
          { type: 'info', value: `Tổng số giao dịch: ${enrichedTransactions.length}` },
          { type: 'empty' }
        ],
        columns: [
          { header: 'Mã giao dịch', key: 'txnRef', width: 18 },
          { header: 'Mã thanh toán', key: 'transactionNo', width: 20 },
          { header: 'Thời gian', key: 'createdAt', width: 18 },
          { header: 'Loại', key: 'type', width: 12 },
          { header: 'Chi tiết', key: 'description', width: 30 },
          { header: 'Số tiền', key: 'amount', width: 15 },
          { header: 'Trạng thái', key: 'status', width: 15 },
          { header: 'Ngân hàng', key: 'bankCode', width: 12 },
          { header: 'Ngày thanh toán', key: 'payDate', width: 18 }
        ],
        data: enrichedTransactions
      };

      // Generate Excel buffer
      const buffer = await exportToExcel(excelConfig);

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${excelConfig.fileName}"`);
      res.setHeader('Content-Length', buffer.length);

      console.log('✅ Excel exported successfully:', excelConfig.fileName);
      return res.send(buffer);

    } catch (error) {
      console.error('Error exporting transactions to Excel:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xuất Excel',
        error: error.message
      });
    }
  }
}

export default new PaymentController();
