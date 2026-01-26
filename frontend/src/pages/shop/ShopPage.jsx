import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faEye } from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/common/Header';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import './css/ShopPage.css';

const API_URL = 'http://localhost:4000/api/v1';

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(false);
  
  const { addItem } = useCart();
  const { showSuccess } = useToast();

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products?visibility=Hiển thị&limit=100`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/products/categories`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(['all', ...data.data]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    showSuccess(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Only show products with stock > 0
      if (product.stock <= 0) {
        return false;
      }
      
      return true;
    });

    return filtered;
  }, [products, selectedCategory, searchQuery, priceRange]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getProductImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/300x300';
    if (imageUrl.startsWith('http')) return imageUrl;
    // If relative path, construct full URL
    return `http://localhost:4000/api/v1${imageUrl}`;
  };

  return (
    <div className="shop-page">
      <Header />
      
      {/* Hero Banner */}
      <div className="shop-hero">
        <div className="hero-content">
          <h1>Cửa Hàng Thể Thao</h1>
          <p>Khám phá các sản phẩm gym chất lượng cao</p>
        </div>
      </div>
      
      <div className="shop-container">
        <div className="shop-main">
          {/* Sidebar Filters */}
          <aside className="shop-sidebar">
            <div className="filter-section">
              <h3>TÌM KIẾM</h3>
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-section">
              <h3>DANH MỤC</h3>
              <div className="category-list">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'TẤT CẢ' : category.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            
          </aside>

          {/* Main Content */}
          <main className="shop-content">
            {loading ? (
              <div className="loading-message">Đang tải sản phẩm...</div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        <img src={getProductImageUrl(product.image_url)} alt={product.name} />
                      </div>
                      
                      <div className="product-info">
                        <h4 className="product-name">{product.name}</h4>

                        <div className="product-price">
                          <span className="current-price">{formatPrice(product.price)}</span>
                        </div>

                        <div className="product-actions">
                          <button 
                            className={`add-to-cart-btn ${product.stock <= 0 ? 'disabled' : ''}`}
                            disabled={product.stock <= 0}
                            onClick={() => handleAddToCart(product)}
                            title={product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                          >
                            <FontAwesomeIcon icon={faShoppingCart} />
                          </button>
                          <Link 
                            to={`/shop/product/${product.id}`} 
                            className="view-details-btn"
                            title="Xem chi tiết"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="no-products">
                    <h3>😞 Không tìm thấy sản phẩm nào</h3>
                    <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="shop-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Royal <span className="text-brand">Fitness</span> Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ShopPage;
