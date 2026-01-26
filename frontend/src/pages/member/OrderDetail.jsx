import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faClock, faTruck, faTimesCircle, faBox, faPrint, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { useOrderDetails } from '../../hooks/useOrders';
import orderService from '../../services/orderService';
import './css/OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { 
    order, 
    loading, 
    error,
    refetch
  } = useOrderDetails(orderId);

  const [cancelling, setCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        setCancelling(true);
        await orderService.cancelMyOrder(orderId);
        alert('Hủy đơn hàng thành công!');
        refetch(); // Refresh order data
        navigate('/member/orders');
      } catch (error) {
        alert(`Lỗi: ${error.message}`);
      } finally {
        setCancelling(false);
      }
    }
  };

  const canCancelOrder = (order) => {
    return order && order.status === 'pending' && order.payment_status !== 'paid';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="od-container">
        <div className="od-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="od-container">
        <div className="od-error">
          <FontAwesomeIcon icon={faTimesCircle} className="od-error-icon" />
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <Link to="/member/orders" className="od-btn od-btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="od-container">
        <div className="od-not-found">
          <FontAwesomeIcon icon={faBox} className="od-not-found-icon" />
          <h3>Không tìm thấy đơn hàng</h3>
          <p>Đơn hàng #{orderId} không tồn tại hoặc bạn không có quyền xem.</p>
          <Link to="/member/orders" className="od-btn od-btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="od-container">
      {/* Header with back button */}
      <div className="od-header">
        <Link to="/member/orders" className="od-back-btn">
          <FontAwesomeIcon icon={faArrowLeft} />
          Quay lại
        </Link>
        <h1>Chi tiết đơn hàng #{order.order_number}</h1>
      </div>

      {/* Status Card */}
      <div className="od-status-card">
        <div className="od-status-header">
          <div className="od-status-info">
            <span className={`od-status-badge od-status-${order.status}`}>
              {order.status === 'pending' && <FontAwesomeIcon icon={faClock} />}
              {order.status === 'confirmed' && <FontAwesomeIcon icon={faCheckCircle} />}
              {order.status === 'processing' && <FontAwesomeIcon icon={faClock} />}
              {order.status === 'shipped' && <FontAwesomeIcon icon={faTruck} />}
              {order.status === 'delivered' && <FontAwesomeIcon icon={faCheckCircle} />}
              {order.status === 'cancelled' && <FontAwesomeIcon icon={faTimesCircle} />}
              {getStatusText(order.status)}
            </span>
            <p className="od-order-date">
              <FontAwesomeIcon icon={faClock} />
              Đặt hàng: {new Date(order.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="od-timeline">
          <div className={`od-timeline-item ${order.status !== 'cancelled' ? 'od-completed' : ''}`}>
            <div className="od-timeline-dot"></div>
            <div className="od-timeline-content">
              <h4>Đơn hàng đã được tạo</h4>
              <p>{new Date(order.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
          
          {order.status !== 'cancelled' && (
            <>
              <div className={`od-timeline-item ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'od-completed' : ''}`}>
                <div className="od-timeline-dot"></div>
                <div className="od-timeline-content">
                  <h4>Đơn hàng được xác nhận</h4>
                  {order.confirmed_at && (
                    <p>{new Date(order.confirmed_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  )}
                </div>
              </div>

              <div className={`od-timeline-item ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'od-completed' : ''}`}>
                <div className="od-timeline-dot"></div>
                <div className="od-timeline-content">
                  <h4>Đang chuẩn bị hàng</h4>
                  {order.processing_at && (
                    <p>{new Date(order.processing_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  )}
                </div>
              </div>

              <div className={`od-timeline-item ${['shipped', 'delivered'].includes(order.status) ? 'od-completed' : ''}`}>
                <div className="od-timeline-dot"></div>
                <div className="od-timeline-content">
                  <h4>Đang giao hàng</h4>
                  {order.shipped_at && (
                    <p>{new Date(order.shipped_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  )}
                </div>
              </div>

              <div className={`od-timeline-item ${order.status === 'delivered' ? 'od-completed' : ''}`}>
                <div className="od-timeline-dot"></div>
                <div className="od-timeline-content">
                  <h4>Đã giao hàng</h4>
                  {order.delivered_at && (
                    <p>{new Date(order.delivered_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="od-items-card">
        <h3>Sản phẩm đã đặt</h3>
        <div className="od-items-list">
          {order.items && order.items.map(item => (
            <div key={item.id} className="od-item">
              <img 
                src={item.product_image} 
                alt={item.product_name}
                className="od-item-image"
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
              <div className="od-item-info">
                <h4 className="od-item-name">{item.product_name}</h4>
                {item.product_description && (
                  <p className="od-item-description">{item.product_description}</p>
                )}
                <div className="od-item-meta">
                  <span>Đơn giá: <strong>{formatCurrency(item.unit_price)}</strong></span>
                  <span>×</span>
                  <span>Số lượng: <strong>{item.quantity}</strong></span>
                </div>
              </div>
              <div className="od-item-total">
                <strong>{formatCurrency(item.total_price)}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Grid */}
      <div className="od-info-grid">
        {/* Shipping Info */}
        <div className="od-info-card">
          <h3>Thông tin giao hàng</h3>
          <div className="od-info-content">
            <p className="od-recipient-name">
              {order.shipping_address?.full_name || order.shipping_name || 'Chưa cập nhật'}
            </p>
            <p className="od-recipient-phone">
              {order.shipping_address?.phone || order.shipping_phone || 'Chưa cập nhật'}
            </p>
            <p className="od-recipient-address">
              {order.shipping_address?.address && (
                <>
                  {order.shipping_address.address}
                  {order.shipping_address.ward && `, ${order.shipping_address.ward}`}
                  {order.shipping_address.district && `, ${order.shipping_address.district}`}
                  {order.shipping_address.province && `, ${order.shipping_address.province}`}
                  {order.shipping_address.postal_code && ` ${order.shipping_address.postal_code}`}
                </>
              )}
              {!order.shipping_address?.address && 'Chưa cập nhật địa chỉ'}
            </p>
            {order.notes && (
              <div className="od-notes">
                <strong>Ghi chú:</strong>
                <p>{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="od-info-card">
          <h3>Thông tin thanh toán</h3>
          <div className="od-info-content">
            <div className="od-payment-row">
              <span>Phương thức:</span>
              <strong>{order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : order.payment_method}</strong>
            </div>
            <div className="od-payment-row">
              <span>Trạng thái:</span>
              <span className={`od-payment-badge od-payment-${order.payment_status}`}>
                {getPaymentStatusText(order.payment_status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Total */}
      <div className="od-total-card">
        <h3>Tổng cộng</h3>
        <div className="od-total-breakdown">
          <div className="od-total-row">
            <span>Tạm tính:</span>
            <span>{formatCurrency(order.subtotal || order.total_amount)}</span>
          </div>
          {order.shipping_fee > 0 && (
            <div className="od-total-row">
              <span>Phí vận chuyển:</span>
              <span>{formatCurrency(order.shipping_fee)}</span>
            </div>
          )}
          {order.discount_amount > 0 && (
            <div className="od-total-row od-discount">
              <span>Giảm giá:</span>
              <span>-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <div className="od-total-row od-final">
            <span>Tổng tiền:</span>
            <strong>{formatCurrency(order.total_amount)}</strong>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="od-actions">
        {canCancelOrder(order) && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="od-btn od-btn-danger"
          >
            <FontAwesomeIcon icon={faTimesCircle} />
            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
          </button>
        )}

        {order.status === 'delivered' && (
          <button className="od-btn od-btn-primary">
            <FontAwesomeIcon icon={faCheckCircle} />
            Đánh giá đơn hàng
          </button>
        )}

        <button 
          onClick={() => window.print()} 
          className="od-btn od-btn-secondary"
        >
          <FontAwesomeIcon icon={faPrint} />
          In hóa đơn
        </button>

        <Link to="/shop" className="od-btn od-btn-primary">
          <FontAwesomeIcon icon={faShoppingBag} />
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
};

export default OrderDetail;