import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './css/CheckoutPackage.css';

const CheckoutPackage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const selectedPackage = location.state?.package;

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderTotal, setOrderTotal] = useState(selectedPackage?.price || 0);
  const [discount, setDiscount] = useState(0);

  // Thông tin banking
  const bankingInfo = {
    bankName: 'Vietcombank',
    accountNumber: '0123456789',
    accountName: 'PHONG TAP GYM FITNESS',
    qrCode: 'https://api.vietqr.io/image/970436-0123456789-compact.png' // Placeholder
  };

  useEffect(() => {
    if (!selectedPackage) {
      navigate('/member/packages');
    }
  }, [selectedPackage, navigate]);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã voucher');
      return;
    }

    setLoading(true);
    setVoucherError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/v1/vouchers/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: voucherCode.toUpperCase(),
          order_value: selectedPackage.price
        })
      });

      const data = await response.json();

      if (data.success) {
        setAppliedVoucher(data.data);
        setDiscount(data.data.discount_amount);
        setOrderTotal(data.data.final_amount);
        setVoucherError('');
      } else {
        setVoucherError(data.message);
        setAppliedVoucher(null);
        setDiscount(0);
        setOrderTotal(selectedPackage.price);
      }
    } catch (error) {
      setVoucherError('Có lỗi xảy ra khi áp dụng voucher');
      console.error('Error applying voucher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setDiscount(0);
    setOrderTotal(selectedPackage.price);
    setVoucherError('');
  };

  const handleCompleteOrder = async () => {
    if (orderTotal === 0) {
      // Miễn phí - Đăng ký trực tiếp
      setLoading(true);
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData.id;

        // Gọi API đăng ký gói tập
        const token = localStorage.getItem('token');
        const voucherNote = appliedVoucher ? `Sử dụng voucher: ${appliedVoucher.voucher_code}` : '';
        
        const response = await fetch('http://localhost:4000/api/v1/member-packages/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            package_id: selectedPackage.id,
            paid_amount: 0,
            notes: voucherNote
          })
        });

        const data = await response.json();

        if (data.success) {
          // Nếu có voucher, tăng used_count
          if (appliedVoucher?.voucher_id) {
            await fetch(`http://localhost:4000/api/v1/vouchers/${appliedVoucher.voucher_id}/use`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }

          showSuccess('🎉 Đăng ký gói tập thành công! Gói của bạn đã được kích hoạt.');
          navigate('/member/packages');
        } else {
          showError('Có lỗi xảy ra: ' + data.message);
        }
      } catch (error) {
        console.error('Error completing free order:', error);
        showError('Có lỗi xảy ra khi đăng ký gói tập');
      } finally {
        setLoading(false);
      }
    } else {
      // Có phí - Chuyển đến trang thanh toán banking
      navigate('/member/packages/payment', {
        state: {
          package: selectedPackage,
          voucher: appliedVoucher,
          discount: discount,
          total: orderTotal,
          bankingInfo: bankingInfo
        }
      });
    }
  };

  if (!selectedPackage) return null;

  return (
    <div className="checkout-package-container">
      <div className="checkout-content">
        {/* Left Side - Order Summary */}
        <div className="checkout-left">
          <div className="checkout-header">
            <button 
              className="btn-back"
              onClick={() => navigate('/member/packages')}
            >
              ← Quay lại
            </button>
            <h2>Thanh toán gói tập</h2>
          </div>

          <div className="order-summary-card">
            <h3>Thông tin đơn hàng</h3>
            
            <div className="package-info">
              <div className="package-name">{selectedPackage.name}</div>
              <div className="package-duration">
                Thời hạn: {Math.floor(selectedPackage.duration_days / 30)} tháng
              </div>
              {selectedPackage.description && (
                <div className="package-description">{selectedPackage.description}</div>
              )}
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Giá gói tập</span>
                <span className="price-value">{selectedPackage.price.toLocaleString('vi-VN')}đ</span>
              </div>

              {appliedVoucher && (
                <div className="price-row discount-row">
                  <span>
                    Giảm giá 
                    <span className="voucher-code-badge">{appliedVoucher.voucher_code}</span>
                  </span>
                  <span className="discount-value">-{discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="price-divider"></div>

              <div className="price-row total-row">
                <span>Tổng thanh toán</span>
                <span className="total-value">
                  {orderTotal.toLocaleString('vi-VN')}đ
                  {orderTotal === 0 && <span className="free-badge">MIỄN PHÍ</span>}
                </span>
              </div>
            </div>

            {selectedPackage.features && selectedPackage.features.length > 0 && (
              <div className="package-features">
                <h4>Quyền lợi gói tập:</h4>
                <ul>
                  {selectedPackage.features.map((feature, index) => (
                    <li key={index}>
                      <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Voucher & Payment */}
        <div className="checkout-right">
          {/* Voucher Section */}
          <div className="voucher-card">
            <h3>Mã giảm giá</h3>
            
            {!appliedVoucher ? (
              <div className="voucher-input-group">
                <input
                  type="text"
                  placeholder="Nhập mã voucher (9 ký tự)"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setVoucherError('');
                  }}
                  maxLength={9}
                  className={voucherError ? 'error' : ''}
                />
                <button 
                  className="btn-apply-voucher"
                  onClick={handleApplyVoucher}
                  disabled={loading || !voucherCode.trim()}
                >
                  {loading ? 'Đang xử lý...' : 'Áp dụng'}
                </button>
              </div>
            ) : (
              <div className="voucher-applied">
                <div className="voucher-success">
                  <svg className="success-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="voucher-info">
                    <div className="voucher-code">{appliedVoucher.voucher_code}</div>
                    <div className="voucher-discount">Giảm {discount.toLocaleString('vi-VN')}đ</div>
                  </div>
                </div>
                <button 
                  className="btn-remove-voucher"
                  onClick={handleRemoveVoucher}
                >
                  ×
                </button>
              </div>
            )}

            {voucherError && (
              <div className="voucher-error">
                <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {voucherError}
              </div>
            )}

            <div className="voucher-hint">
              💡 Mã voucher có thể giảm giá lên đến 100% (miễn phí)
            </div>
          </div>

          {/* Payment Info */}
          {orderTotal > 0 && (
            <div className="payment-info-card">
              <h3>Thông tin thanh toán</h3>
              <div className="payment-notice">
                <svg className="info-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Chuyển khoản ngân hàng</strong>
                  <p>Bạn sẽ được chuyển đến trang hướng dẫn chuyển khoản</p>
                </div>
              </div>

              <div className="bank-preview">
                <div className="bank-row">
                  <span className="bank-label">Ngân hàng:</span>
                  <span className="bank-value">{bankingInfo.bankName}</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">Số tài khoản:</span>
                  <span className="bank-value">{bankingInfo.accountNumber}</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">Chủ tài khoản:</span>
                  <span className="bank-value">{bankingInfo.accountName}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="checkout-actions">
            <button 
              className="btn-complete-order"
              onClick={handleCompleteOrder}
              disabled={loading}
            >
              {loading ? (
                'Đang xử lý...'
              ) : orderTotal === 0 ? (
                '✓ Đăng ký miễn phí'
              ) : (
                `Thanh toán ${orderTotal.toLocaleString('vi-VN')}đ`
              )}
            </button>
            <button 
              className="btn-cancel"
              onClick={() => navigate('/member/packages')}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPackage;
