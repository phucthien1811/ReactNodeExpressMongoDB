import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import './css/ShopBankingPayment.css';

const ShopBankingPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const { clearSelectedItems } = useCart();
  
  const { orderData, orderInfo } = location.state || {};
  
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [copied, setCopied] = useState({
    accountNumber: false,
    amount: false,
    content: false
  });

  const handlePaymentComplete = React.useCallback(() => {
    clearSelectedItems();
    showSuccess('🎉 Đã xác nhận thanh toán thành công!');
    
    setTimeout(() => {
      navigate('/order-success', { 
        state: { 
          orderId: orderInfo.id,
          orderNumber: orderInfo.order_number,
          totalAmount: orderInfo.total_amount,
          paymentMethod: 'BANK_TRANSFER'
        } 
      });
    }, 100);
  }, [clearSelectedItems, showSuccess, navigate, orderInfo]);

  useEffect(() => {
    if (!orderData || !orderInfo) {
      navigate('/cart');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handlePaymentComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderData, orderInfo, navigate, handlePaymentComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  if (!orderData || !orderInfo) {
    return null;
  }

  const bankInfo = {
    bankName: 'VietQR Bank',
    accountNumber: '1234567890',
    accountName: 'GYM FITNESS CENTER',
    amount: orderInfo.total_amount,
    content: `DH ${orderInfo.order_number}`
  };

  // Generate VietQR URL
  const qrUrl = `https://img.vietqr.io/image/970415-${bankInfo.accountNumber}-compact2.png?amount=${bankInfo.amount}&addInfo=${encodeURIComponent(bankInfo.content)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

  return (
    <div className="shop-banking-payment">
      <div className="payment-container">
        <div className="payment-header">
          <h1>💳 Thanh toán chuyển khoản</h1>
          <div className="timer-warning">
            <span className="timer-icon">⏰</span>
            <span className="timer-text">
              Vui lòng hoàn tất thanh toán trong: <strong>{formatTime(timeLeft)}</strong>
            </span>
          </div>
        </div>

        <div className="payment-content">
          {/* QR Code Section */}
          <div className="qr-section">
            <div className="qr-card">
              <h2>Quét mã QR để thanh toán</h2>
              <div className="qr-code-wrapper">
                <img 
                  src={qrUrl} 
                  alt="QR Code Payment" 
                  className="qr-code-image"
                />
              </div>
              <p className="qr-note">
                📱 Sử dụng ứng dụng Banking để quét mã QR
              </p>
            </div>
          </div>

          {/* Bank Info Section */}
          <div className="bank-info-section">
            <div className="info-card">
              <h2>Thông tin chuyển khoản</h2>
              
              <div className="info-group">
                <label>🏦 Ngân hàng:</label>
                <div className="info-value">
                  <span>{bankInfo.bankName}</span>
                </div>
              </div>

              <div className="info-group">
                <label>👤 Chủ tài khoản:</label>
                <div className="info-value">
                  <span>{bankInfo.accountName}</span>
                </div>
              </div>

              <div className="info-group">
                <label>💳 Số tài khoản:</label>
                <div className="info-value copy-field">
                  <span className="value-text">{bankInfo.accountNumber}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(bankInfo.accountNumber, 'accountNumber')}
                  >
                    {copied.accountNumber ? '✓ Đã sao chép' : '📋 Sao chép'}
                  </button>
                </div>
              </div>

              <div className="info-group">
                <label>💰 Số tiền:</label>
                <div className="info-value copy-field">
                  <span className="value-text amount">{formatCurrency(bankInfo.amount)}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(bankInfo.amount.toString(), 'amount')}
                  >
                    {copied.amount ? '✓ Đã sao chép' : '📋 Sao chép'}
                  </button>
                </div>
              </div>

              <div className="info-group">
                <label>📝 Nội dung chuyển khoản:</label>
                <div className="info-value copy-field">
                  <span className="value-text content">{bankInfo.content}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(bankInfo.content, 'content')}
                  >
                    {copied.content ? '✓ Đã sao chép' : '📋 Sao chép'}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary-card">
              <h3>📦 Thông tin đơn hàng</h3>
              <div className="summary-item">
                <span>Mã đơn hàng:</span>
                <strong>{orderInfo.order_number}</strong>
              </div>
              <div className="summary-item">
                <span>Tổng tiền:</span>
                <strong className="total-amount">{formatCurrency(orderInfo.total_amount)}</strong>
              </div>
            </div>

            {/* Instructions */}
            <div className="instructions-card">
              <h3>📌 Hướng dẫn thanh toán</h3>
              <ol>
                <li>Mở ứng dụng Banking trên điện thoại</li>
                <li>Quét mã QR hoặc nhập thông tin chuyển khoản</li>
                <li>Kiểm tra kỹ thông tin và xác nhận thanh toán</li>
                <li>Hệ thống sẽ tự động xác nhận sau khi thanh toán thành công</li>
              </ol>
            </div>

            {/* Manual Confirm Button */}
            <div className="action-buttons">
              <button 
                className="btn-confirm"
                onClick={handlePaymentComplete}
              >
                ✓ Tôi đã chuyển khoản
              </button>
              <button 
                className="btn-cancel"
                onClick={() => navigate('/cart')}
              >
                ← Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopBankingPayment;
