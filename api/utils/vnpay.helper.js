// File: api/utils/vnpay.helper.js
// Implementation hoàn toàn giống code demo VNPAY official

import crypto from 'crypto';
import moment from 'moment';

class VNPayHelper {
  /**
   * Sắp xếp object theo key alphabet
   */
  static sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  /**
   * Tạo URL thanh toán VNPAY
   */
  static createPaymentUrl(config, params) {
    // Tạo vnp_Params object
    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: config.vnp_TmnCode,
      vnp_Locale: params.language || 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: String(params.orderId),
      vnp_OrderInfo: params.orderDescription,
      vnp_OrderType: params.orderType || 'other',
      vnp_Amount: String(Math.round((params.amount || 0) * 100)),
      vnp_ReturnUrl: config.vnp_ReturnUrl,
      vnp_IpAddr: params.ipAddr,
      vnp_CreateDate: moment().format('YYYYMMDDHHmmss')
    };

    // Thêm bankCode nếu có
    if (params.bankCode) {
      vnp_Params.vnp_BankCode = params.bankCode;
    }

    // Sort params
    const sortedParams = this.sortObject(vnp_Params);

    // Tạo sign data string
    const signDataArray = [];
    for (const key in sortedParams) {
      if (sortedParams[key] !== '' && sortedParams[key] !== undefined && sortedParams[key] !== null) {
        signDataArray.push(key + '=' + sortedParams[key]);
      }
    }
    const signData = signDataArray.join('&');

    console.log('🔐 Sign data:', signData);

    // Tạo HMAC SHA512
    const hmac = crypto.createHmac('sha512', config.vnp_HashSecret);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    console.log('🔐 Secure hash:', secureHash);

    // Tạo query string với encode
    const queryArray = [];
    for (const key in sortedParams) {
      if (sortedParams[key] !== '' && sortedParams[key] !== undefined && sortedParams[key] !== null) {
        queryArray.push(encodeURIComponent(key) + '=' + encodeURIComponent(sortedParams[key]));
      }
    }
    queryArray.push('vnp_SecureHash=' + secureHash);

    const paymentUrl = config.vnp_Url + '?' + queryArray.join('&');

    console.log('� Payment URL:', paymentUrl);

    return paymentUrl;
  }

  /**
   * Verify return URL từ VNPAY
   */
  static verifyReturnUrl(vnp_Params, secureHash, hashSecret) {
    // Xóa secure hash params
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sort
    const sortedParams = this.sortObject(vnp_Params);

    // Tạo sign data
    const signDataArray = [];
    for (const key in sortedParams) {
      if (sortedParams[key] !== '' && sortedParams[key] !== undefined && sortedParams[key] !== null) {
        signDataArray.push(key + '=' + sortedParams[key]);
      }
    }
    const signData = signDataArray.join('&');

    // Compute hash
    const hmac = crypto.createHmac('sha512', hashSecret);
    const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    console.log('🔐 Verify - Sign data:', signData);
    console.log('🔐 Verify - Calculated:', calculatedHash);
    console.log('🔐 Verify - Received:', secureHash);

    return secureHash === calculatedHash;
  }

  /**
   * Lấy message từ response code
   */
  static getResponseMessage(responseCode) {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ.',
      '09': 'Thẻ/Tài khoản chưa đăng ký InternetBanking.',
      '10': 'Xác thực thông tin không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Nhập sai mật khẩu OTP',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng đang bảo trì',
      '79': 'Nhập sai mật khẩu quá số lần quy định',
      '99': 'Lỗi không xác định'
    };
    return messages[responseCode] || 'Lỗi không xác định';
  }
}

export default VNPayHelper;
