import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './css/PaymentResultPage.css';

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Get all query params from VNPAY callback
        const params = {};
        for (let [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        console.log('🔍 VNPAY callback params:', params);

        // Call backend to verify payment
        const response = await fetch(`http://localhost:4000/api/v1/payment/vnpay-return?${searchParams.toString()}`);
        const data = await response.json();

        console.log('💳 Payment verification result:', data);

        setPaymentResult(data);
        setLoading(false);

        if (data.success) {
          showSuccess('✅ Thanh toán thành công!');
        } else {
          showError('❌ Thanh toán thất bại: ' + data.message);
        }
      } catch (error) {
        console.error('❌ Error processing payment result:', error);
        setPaymentResult({
          success: false,
          message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
        });
        setLoading(false);
        showError('Có lỗi xảy ra khi xử lý thanh toán');
      }
    };

    processPaymentResult();
  }, [searchParams, showSuccess, showError]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/member/orders');
  };

  if (loading) {
    return (
      <div className="payment-result-page">
        <div className="result-container loading">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <h2>Đang xử lý kết quả thanh toán...</h2>
          <p>Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="result-container">
        {paymentResult?.success ? (
          <>
            <div className="result-icon success">
              <FontAwesomeIcon icon={faCheckCircle} size="5x" />
            </div>
            <h1>Thanh toán thành công!</h1>
            <p className="result-message">
              Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xác nhận.
            </p>
            
            {paymentResult.data && (
              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Mã giao dịch:</span>
                  <span className="value">{paymentResult.data.txnRef}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Số tiền:</span>
                  <span className="value amount">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(paymentResult.data.amount)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Mã giao dịch VNPAY:</span>
                  <span className="value">{paymentResult.data.transactionNo}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ngân hàng:</span>
                  <span className="value">{paymentResult.data.bankCode}</span>
                </div>
              </div>
            )}
            
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleViewOrders}>
                Xem đơn hàng
              </button>
              <button className="btn btn-secondary" onClick={handleBackToHome}>
                Về trang chủ
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="result-icon failed">
              <FontAwesomeIcon icon={faTimesCircle} size="5x" />
            </div>
            <h1>Thanh toán thất bại</h1>
            <p className="result-message error">
              {paymentResult?.message || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
            </p>
            
            {paymentResult?.data && (
              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Mã giao dịch:</span>
                  <span className="value">{paymentResult.data.txnRef}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Mã lỗi:</span>
                  <span className="value">{paymentResult.data.responseCode}</span>
                </div>
              </div>
            )}
            
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleViewOrders}>
                Xem đơn hàng
              </button>
              <button className="btn btn-secondary" onClick={handleBackToHome}>
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
