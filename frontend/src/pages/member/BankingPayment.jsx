import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './css/BankingPayment.css';

const BankingPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const { package: selectedPackage, voucher, discount, total, bankingInfo } = location.state || {};

  const [copied, setCopied] = useState('');
  const [timer, setTimer] = useState(15 * 60); // 15 phút
  const [autoConfirmed, setAutoConfirmed] = useState(false);

  const handleAutoConfirmPayment = async () => {
    if (autoConfirmed) return; // Prevent double execution
    setAutoConfirmed(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id;

      // Gọi API đăng ký gói tập
      const token = localStorage.getItem('token');
      const voucherNote = voucher ? `Sử dụng voucher: ${voucher.voucher_code}` : '';
      
      const response = await fetch('http://localhost:4000/api/v1/member-packages/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          package_id: selectedPackage.id,
          paid_amount: total,
          notes: voucherNote
        })
      });

      const data = await response.json();

      if (data.success) {
        // Nếu có voucher, tăng used_count
        if (voucher?.voucher_id) {
          await fetch(`http://localhost:4000/api/v1/vouchers/${voucher.voucher_id}/use`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }

        showSuccess('🎉 Chuyển khoản thành công! Bạn đã đăng ký gói tập thành công. Gói của bạn đã được kích hoạt.');
        navigate('/member/packages');
      } else {
        showError('Có lỗi xảy ra: ' + data.message);
      }
    } catch (error) {
      console.error('Error auto-confirming payment:', error);
      showError('Có lỗi xảy ra khi xác nhận thanh toán');
    }
  };

  useEffect(() => {
    if (!selectedPackage) {
      navigate('/member/packages');
      return;
    }

    // Countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Tự động xác nhận sau 20s
          handleAutoConfirmPayment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackage, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleConfirmPayment = () => {
    handleAutoConfirmPayment();
  };

  if (!selectedPackage) return null;

  // Generate transfer content
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const transferContent = `GYMPACK ${userData.id || 'USER'} ${selectedPackage.id}`;

  return (
    <div className="banking-payment-container">
      <div className="banking-content">
        {/* Header */}
        <div className="banking-header">
          <button 
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>
          <h2>Chuyển khoản thanh toán</h2>
          <div className="timer-badge">
            <svg className="timer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(timer)}
          </div>
        </div>

        <div className="banking-grid">
          {/* Left - QR Code & Bank Info */}
          <div className="banking-left">
            <div className="qr-code-card">
              <h3>Quét mã QR để chuyển khoản</h3>
              <div className="qr-code-wrapper">
                <img 
                  src={`https://img.vietqr.io/image/${bankingInfo?.bankName || 'VIETCOMBANK'}-${bankingInfo?.accountNumber || '0123456789'}-compact.jpg?amount=${total}&addInfo=${encodeURIComponent(transferContent)}`}
                  alt="QR Code"
                  className="qr-code-image"
                />
              </div>
              <p className="qr-hint">Sử dụng app ngân hàng để quét mã QR</p>
            </div>

            <div className="bank-info-card">
              <h3>Thông tin chuyển khoản</h3>
              
              <div className="bank-info-row">
                <div className="info-label">Ngân hàng</div>
                <div className="info-value-group">
                  <span className="info-value">{bankingInfo?.bankName || 'Vietcombank'}</span>
                  <button 
                    className="btn-copy"
                    onClick={() => handleCopy(bankingInfo?.bankName || 'Vietcombank', 'bank')}
                  >
                    {copied === 'bank' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="bank-info-row">
                <div className="info-label">Số tài khoản</div>
                <div className="info-value-group">
                  <span className="info-value">{bankingInfo?.accountNumber || '0123456789'}</span>
                  <button 
                    className="btn-copy"
                    onClick={() => handleCopy(bankingInfo?.accountNumber || '0123456789', 'account')}
                  >
                    {copied === 'account' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="bank-info-row">
                <div className="info-label">Chủ tài khoản</div>
                <div className="info-value-group">
                  <span className="info-value">{bankingInfo?.accountName || 'PHONG TAP GYM FITNESS'}</span>
                  <button 
                    className="btn-copy"
                    onClick={() => handleCopy(bankingInfo?.accountName || 'PHONG TAP GYM FITNESS', 'name')}
                  >
                    {copied === 'name' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="bank-info-row highlight">
                <div className="info-label">Số tiền</div>
                <div className="info-value-group">
                  <span className="info-value amount">{total.toLocaleString('vi-VN')}đ</span>
                  <button 
                    className="btn-copy"
                    onClick={() => handleCopy(total.toString(), 'amount')}
                  >
                    {copied === 'amount' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="bank-info-row highlight">
                <div className="info-label">Nội dung CK</div>
                <div className="info-value-group">
                  <span className="info-value transfer-content">{transferContent}</span>
                  <button 
                    className="btn-copy"
                    onClick={() => handleCopy(transferContent, 'content')}
                  >
                    {copied === 'content' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="important-notice">
                <svg className="warning-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Lưu ý quan trọng:</strong>
                  <p>Vui lòng chuyển <strong>ĐÚNG SỐ TIỀN</strong> và ghi <strong>ĐÚNG NỘI DUNG</strong> để hệ thống tự động xác nhận.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="banking-right">
            <div className="order-summary-card">
              <h3>Thông tin đơn hàng</h3>
              
              <div className="order-item">
                <div className="item-name">{selectedPackage.name}</div>
                <div className="item-price">{selectedPackage.price.toLocaleString('vi-VN')}đ</div>
              </div>

              {voucher && (
                <div className="order-item discount-item">
                  <div className="item-name">
                    Giảm giá ({voucher.voucher_code})
                  </div>
                  <div className="item-price discount">-{discount.toLocaleString('vi-VN')}đ</div>
                </div>
              )}

              <div className="order-divider"></div>

              <div className="order-total">
                <div className="total-label">Tổng thanh toán</div>
                <div className="total-amount">{total.toLocaleString('vi-VN')}đ</div>
              </div>
            </div>

            <div className="instructions-card">
              <h3>Hướng dẫn thanh toán</h3>
              <ol className="instructions-list">
                <li>
                  <span className="step-number">1</span>
                  <span className="step-text">Mở app ngân hàng của bạn</span>
                </li>
                <li>
                  <span className="step-number">2</span>
                  <span className="step-text">Quét mã QR hoặc chuyển khoản thủ công</span>
                </li>
                <li>
                  <span className="step-number">3</span>
                  <span className="step-text">Kiểm tra thông tin và xác nhận</span>
                </li>
                <li>
                  <span className="step-number">4</span>
                  <span className="step-text">Hoàn tất thanh toán</span>
                </li>
              </ol>
            </div>

            <div className="action-buttons">
              <button 
                className="btn-confirm"
                onClick={handleConfirmPayment}
              >
                Tôi đã chuyển khoản
              </button>
              <button 
                className="btn-cancel"
                onClick={() => navigate('/member/packages')}
              >
                Hủy giao dịch
              </button>
            </div>

            <div className="support-info">
              <svg className="support-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <div>
                <strong>Cần hỗ trợ?</strong>
                <p>Liên hệ: 1900 1234 hoặc support@gymfitness.vn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankingPayment;
