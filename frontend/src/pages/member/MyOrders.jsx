import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCheckCircle, faClock, faTruck, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useOrders } from '../../hooks/useOrders';
import './css/MyOrders.css';

const MyOrders = () => {
  const { 
    orders, 
    loading, 
    error, 
    pagination, 
    fetchOrders, 
    cancelOrder,
    formatCurrency,
    getStatusText
  } = useOrders();

  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to get product image URL
  const getProductImageUrl = (imageUrl) => {
    if (!imageUrl) return '/images/placeholder.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    // If relative path, construct full URL
    return `http://localhost:4000/api/v1${imageUrl}`;
  };

  // Fetch orders when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10
    };
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    
    fetchOrders(params);
  }, [currentPage, statusFilter, fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await cancelOrder(orderId);
        alert('Hủy đơn hàng thành công!');
      } catch (error) {
        alert(`Lỗi: ${error.message}`);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const canCancelOrder = (order) => {
    return order.status === 'pending' && order.payment_status !== 'paid';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="mo-container">
        <div className="mo-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mo-container">
      {/* Header */}
      <div className="mo-header">
        <h1>Đơn hàng của tôi</h1>
      </div>

      {/* Filter */}
      <div className="mo-filter-bar">
        <select 
          className="mo-status-select"
          value={statusFilter} 
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipped">Đang giao hàng</option>
          <option value="delivered">Đã giao hàng</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {error && (
        <div className="mo-error">
          <FontAwesomeIcon icon={faTimesCircle} />
          <p>{error}</p>
        </div>
      )}

      {orders.length === 0 && !loading ? (
        <div className="mo-empty">
          <FontAwesomeIcon icon={faBox} className="mo-empty-icon" />
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
          <Link to="/shop" className="mo-btn mo-btn-primary">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <>
          <div className="mo-orders-list">
            {orders.map(order => (
              <div key={order.id} className="mo-order-card">
                {/* Card Header */}
                <div className="mo-card-header">
                  <div className="mo-order-info">
                    <h3 className="mo-order-number">Đơn hàng #{order.order_number}</h3>
                    <span className="mo-order-date">
                      <FontAwesomeIcon icon={faClock} />
                      {new Date(order.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <span 
                    className={`mo-status-badge mo-status-${order.status}`}
                  >
                    {order.status === 'pending' && <FontAwesomeIcon icon={faClock} />}
                    {order.status === 'confirmed' && <FontAwesomeIcon icon={faCheckCircle} />}
                    {order.status === 'processing' && <FontAwesomeIcon icon={faClock} />}
                    {order.status === 'shipped' && <FontAwesomeIcon icon={faTruck} />}
                    {order.status === 'delivered' && <FontAwesomeIcon icon={faCheckCircle} />}
                    {order.status === 'cancelled' && <FontAwesomeIcon icon={faTimesCircle} />}
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Order Items */}
                <div className="mo-items-container">
                  {order.items && order.items.slice(0, 3).map(item => (
                    <div key={item.id} className="mo-item">
                      <img 
                        src={getProductImageUrl(item.product_image)} 
                        alt={item.product_name}
                        className="mo-item-image"
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="mo-item-details">
                        <h4 className="mo-item-name">{item.product_name}</h4>
                        <p className="mo-item-quantity">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="mo-item-price">
                        {formatCurrency(item.total_price)}
                      </div>
                    </div>
                  ))}
                  
                  {order.items && order.items.length > 3 && (
                    <div className="mo-more-items">
                      +{order.items.length - 3} sản phẩm khác
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="mo-summary">
                  <div className="mo-payment-info">
                    <span className="mo-payment-method">
                      Thanh toán: <strong>{order.payment_method === 'COD' ? 'COD' : order.payment_method}</strong>
                    </span>
                    <span className={`mo-payment-status mo-payment-${order.payment_status}`}>
                      {order.payment_status === 'pending' ? 'Chờ thanh toán' : 
                       order.payment_status === 'paid' ? 'Đã thanh toán' : 
                       order.payment_status}
                    </span>
                  </div>
                  <div className="mo-total">
                    <span>Tổng cộng:</span>
                    <strong className="mo-total-amount">{formatCurrency(order.total_amount)}</strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="mo-actions">
                  <Link 
                    to={`/member/orders/${order.id}`}
                    className="mo-btn mo-btn-secondary"
                  >
                    Xem chi tiết
                  </Link>
                  
                  {canCancelOrder(order) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="mo-btn mo-btn-danger"
                      disabled={loading}
                    >
                      Hủy đơn hàng
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <button className="mo-btn mo-btn-primary">
                      Đánh giá
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mo-pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="mo-page-btn"
              >
                ‹ Trước
              </button>
              
              <div className="mo-page-numbers">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`mo-page-btn ${currentPage === page ? 'mo-active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="mo-page-btn"
              >
                Sau ›
              </button>
            </div>
          )}

          <div className="mo-pagination-info">
            Hiển thị {orders.length} trong tổng số {pagination.total} đơn hàng
          </div>
        </>
      )}
    </div>
  );
};

export default MyOrders;
