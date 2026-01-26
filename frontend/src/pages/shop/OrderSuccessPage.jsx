import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import './css/OrderSuccess.css';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const [countdown, setCountdown] = useState(6);

  // Countdown timer và auto redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/shop');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div>
      <Header />
      <div className="order-success-page">
        <div className="success-container">
          {/* Success Animation */}
          <div className="success-animation">
            <div className="success-circle">
              <div className="checkmark">
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
          </div>

          {/* Success Content */}
          <div className="success-content">
            <h1 className="success-title">Cảm ơn bạn đã đặt hàng!</h1>
            <p className="success-subtitle">
              Đơn hàng của bạn đã được xác nhận và đang được xử lý
            </p>

            {/* Order Info Card */}
            <div className="order-info-card">
              <div className="order-number">
                <span className="label">Mã đơn hàng</span>
                <span className="value">#{orderNumber}</span>
              </div>
              
              {order && (
                <>
                  <div className="order-amount">
                    <span className="label">Tổng tiền</span>
                    <span className="value">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(order.total_amount)}
                    </span>
                  </div>
                  <div className="payment-method">
                    <span className="label">Thanh toán</span>
                    <span className="value">
                      {order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : order.payment_method}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Countdown */}
            <div className="redirect-notice">
              <p>Tự động chuyển về trang mua sắm sau {countdown} giây</p>
              <div className="countdown-bar">
                <div 
                  className="countdown-progress" 
                  style={{ width: `${((6 - countdown) / 6) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/shop')}
              >
                Tiếp tục mua sắm
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/member/orders')}
              >
                Xem đơn hàng
              </button>
            </div>

            {/* Next Steps */}
            <div className="next-steps-card">
              <h3>Bước tiếp theo:</h3>
              <div className="steps-grid">
                <div className="step-item">
                  <div className="step-icon">📞</div>
                  <div className="step-text">Xác nhận đơn hàng trong 2-4 giờ</div>
                </div>
                <div className="step-item">
                  <div className="step-icon">📦</div>
                  <div className="step-text">Giao hàng trong 2-3 ngày</div>
                </div>
                <div className="step-item">
                  <div className="step-icon">🔍</div>
                  <div className="step-text">Theo dõi đơn hàng trong tài khoản</div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="contact-card">
              <h4>Cần hỗ trợ?</h4>
              <div className="contact-items">
                <div className="contact-item">
                  <span className="icon">📞</span>
                  <span>0123 456 789</span>
                </div>
                <div className="contact-item">
                  <span className="icon">📧</span>
                  <span>support@royalfitness.vn</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Particles */}
          <div className="floating-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
          </div>
        </div>

        {/* Detailed Order Info (Collapsible) */}
        {order && (order.shipping_address || (order.items && order.items.length > 0)) && (
          <div className="order-details-section">
            <div className="container">
              <div className="details-card">
                {order.shipping_address && (
                  <div className="shipping-info">
                    <h4>📍 Địa chỉ giao hàng</h4>
                    <div className="address-info">
                      {order.shipping_address.full_name && <p><strong>{order.shipping_address.full_name}</strong></p>}
                      {order.shipping_address.phone && <p>📞 {order.shipping_address.phone}</p>}
                      <p>
                        {order.shipping_address.address && `${order.shipping_address.address}`}
                        {order.shipping_address.ward && `, ${order.shipping_address.ward}`}
                        {order.shipping_address.district && `, ${order.shipping_address.district}`}
                        {order.shipping_address.province && `, ${order.shipping_address.province}`}
                        {order.shipping_address.postal_code && ` ${order.shipping_address.postal_code}`}
                      </p>
                    </div>
                  </div>
                )}

                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <h4>🛍️ Sản phẩm đã đặt</h4>
                    <div className="items-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-image">
                            <img src={item.product_image || '/placeholder-product.jpg'} alt={item.product_name} />
                          </div>
                          <div className="item-info">
                            <h5>{item.product_name}</h5>
                            <div className="item-details">
                              <span>Số lượng: {item.quantity}</span>
                              <span>
                                Đơn giá: {new Intl.NumberFormat('vi-VN', { 
                                  style: 'currency', 
                                  currency: 'VND' 
                                }).format(item.unit_price)}
                              </span>
                            </div>
                          </div>
                          <div className="item-total">
                            {new Intl.NumberFormat('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND' 
                            }).format(item.total_price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;