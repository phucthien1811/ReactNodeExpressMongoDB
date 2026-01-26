import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './css/CartPage.css';

const CartPage = () => {
  const { 
    items, 
    selectedItems, 
    selectedItemsArray,
    removeItem, 
    updateQuantity, 
    toggleSelectItem, 
    selectAllItems, 
    deselectAllItems,
    selectedSubtotal,
    selectedTotalItems
  } = useCart();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (selectedItemsArray.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    // Navigate to checkout page
    navigate('/checkout');
  };

  const calculateShipping = () => {
    return selectedSubtotal > 500000 ? 0 : 30000; // Free shipping over 500k
  };

  const calculateTotal = () => {
    return selectedSubtotal + calculateShipping();
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <Header />
        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Giỏ hàng trống</h2>
            <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <Link to="/shop" className="continue-shopping-btn">
              🛍️ Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Header />
      
      <div className="cart-container">
        <div className="cart-header">
          <h1>🛒 Giỏ hàng của bạn</h1>
          <Link to="/shop" className="continue-shopping-link">
            ← Tiếp tục mua sắm
          </Link>
        </div>

        <div className="cart-main">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <div className="select-all">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === items.length && items.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span className="checkmark"></span>
                  Chọn tất cả ({items.length} sản phẩm)
                </label>
              </div>
              <div className="cart-actions">
                <button 
                  onClick={deselectAllItems}
                  className="deselect-btn"
                  disabled={selectedItems.size === 0}
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>

            <div className="cart-items-list">
              {items.map(item => (
                <div key={item.id} className={`cart-item ${selectedItems.has(item.id) ? 'selected' : ''}`}>
                  <div className="item-select">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>

                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="item-details">
                    <h4 className="item-name">{item.name}</h4>
                  </div>

                  <div className="item-price">
                    <span className="current-price">{formatPrice(item.price)}</span>
                  </div>

                  <div className="item-quantity">
                    <button 
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    {formatPrice(item.price * item.quantity)}
                  </div>

                  <div className="item-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      title="Xóa sản phẩm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h3>📋 Thông tin đơn hàng</h3>
              
              <div className="summary-row">
                <span>Sản phẩm đã chọn:</span>
                <span>{selectedTotalItems} sản phẩm</span>
              </div>

              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(selectedSubtotal)}</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>
                  {calculateShipping() === 0 ? (
                    <span className="free-shipping">Miễn phí</span>
                  ) : (
                    formatPrice(calculateShipping())
                  )}
                </span>
              </div>

              {selectedSubtotal < 500000 && selectedSubtotal > 0 && (
                <div className="shipping-note">
                  💡 Mua thêm {formatPrice(500000 - selectedSubtotal)} để được miễn phí vận chuyển
                </div>
              )}

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Tổng cộng:</span>
                <span className="total-price">{formatPrice(calculateTotal())}</span>
              </div>

              <button 
                className={`checkout-btn ${selectedItemsArray.length === 0 ? 'disabled' : ''}`}
                onClick={handleCheckout}
                disabled={selectedItemsArray.length === 0}
              >
                💳 Thanh toán ({selectedItemsArray.length} sản phẩm)
              </button>

              {!user && (
                <div className="login-note">
                  💡 <Link to="/login">Đăng nhập</Link> để tiếp tục thanh toán
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
