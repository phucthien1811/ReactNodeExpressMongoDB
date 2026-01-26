import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faPen, 
    faTrash, 
    faSearch, 
    faEye, 
    faEyeSlash,
    faInfo,
    faTimes,
    faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../context/ToastContext';
import './css/AdminProducts.css';

const API_URL = 'http://localhost:4000/api/v1';

// Danh sách categories có sẵn
const CATEGORIES = [
    'Thực phẩm bổ sung',
    'Thiết bị',
    'Trang phục',
    'Phụ kiện'
];

export default function AdminProducts() {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [newProduct, setNewProduct] = useState({
        code: '',
        name: '',
        category: 'Thực phẩm bổ sung',
        description: '',
        price: 0,
        stock: 0,
        image_url: 'https://placehold.co/300x300/374151/FFFFFF?text=Product',
        visibility: 'Hiển thị'
    });

    // Generate product code automatically
    const generateProductCode = () => {
        const prefix = 'SP';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `${prefix}${timestamp}${random}`;
    };

    // Fetch products from API
    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                ...(searchTerm && { search: searchTerm })
            });

            const response = await fetch(`${API_URL}/products?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setProducts(data.data);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('Không thể tải danh sách sản phẩm', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryClass = (category) => {
        switch(category) {
            case 'Thực phẩm bổ sung': return 'ap-category-supplement';
            case 'Thiết bị': return 'ap-category-equipment';
            case 'Trang phục': return 'ap-category-clothing';
            case 'Phụ kiện': return 'ap-category-accessories';
            default: return 'ap-category-supplement';
        }
    };

    const getStockClass = (stock) => {
        if (stock === 0) return 'ap-stock-out';
        if (stock <= 10) return 'ap-stock-low';
        return 'ap-stock-good';
    };

    const getStockText = (stock) => {
        if (stock === 0) return 'Hết hàng';
        if (stock <= 10) return 'Sắp hết';
        return 'Còn hàng';
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'Hết hàng': return 'ap-status-out';
            case 'Sắp hết': return 'ap-status-low';
            case 'Còn hàng': return 'ap-status-good';
            default: return 'ap-status-good';
        }
    };

    const getVisibilityClass = (visibility) => {
        return visibility === 'Hiển thị' ? 'ap-visibility-visible' : 'ap-visibility-hidden';
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleExportExcel = async () => {
        try {
            showToast('Đang xuất Excel...', 'info');
            
            const response = await fetch(`${API_URL}/products/export/excel`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể xuất Excel');
            }

            // Get blob from response
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DanhSachSanPham_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('✅ Xuất Excel thành công!', 'success');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            showToast('❌ Lỗi khi xuất Excel', 'error');
        }
    };

    const handleInputChange = (e, isEdit = false) => {
        const { name, value } = e.target;
        if (isEdit) {
            setEditingProduct(prev => ({
                ...prev,
                [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
            }));
        } else {
            setNewProduct(prev => ({
                ...prev,
                [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const response = await fetch(`${API_URL}/uploads/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                return data.imageUrl;
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast('Lỗi khi upload ảnh', 'error');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price) {
            showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
            return;
        }

        try {
            // Upload image first if selected
            let imageUrl = newProduct.image_url;
            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            // Auto-generate product code if not provided
            const productData = {
                ...newProduct,
                code: newProduct.code || generateProductCode(),
                image_url: imageUrl
            };

            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (data.success) {
                showToast('Thêm sản phẩm thành công!', 'success');
                setNewProduct({
                    code: '',
                    name: '',
                    category: 'Thực phẩm bổ sung',
                    description: '',
                    price: 0,
                    stock: 0,
                    image_url: 'https://placehold.co/300x300/374151/FFFFFF?text=Product',
                    visibility: 'Hiển thị'
                });
                setImageFile(null);
                setImagePreview(null);
                setShowAddModal(false);
                fetchProducts();
            } else {
                showToast(data.message || 'Không thể thêm sản phẩm', 'error');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            showToast('Lỗi khi thêm sản phẩm', 'error');
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
        setImageFile(null);
        setImagePreview(null);
        setShowEditModal(true);
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct.code || !editingProduct.name || !editingProduct.price) {
            showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
            return;
        }

        try {
            // Upload new image if selected
            let imageUrl = editingProduct.image_url;
            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const productData = {
                ...editingProduct,
                image_url: imageUrl
            };

            const response = await fetch(`${API_URL}/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (data.success) {
                showToast('Cập nhật sản phẩm thành công!', 'success');
                setShowEditModal(false);
                setEditingProduct(null);
                setImageFile(null);
                setImagePreview(null);
                fetchProducts();
            } else {
                showToast(data.message || 'Không thể cập nhật sản phẩm', 'error');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            showToast('Lỗi khi cập nhật sản phẩm', 'error');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                showToast('Xóa sản phẩm thành công!', 'success');
                fetchProducts();
            } else {
                showToast(data.message || 'Không thể xóa sản phẩm', 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('Lỗi khi xóa sản phẩm', 'error');
        }
    };

    const handleToggleVisibility = async (productId) => {
        try {
            const response = await fetch(`${API_URL}/products/${productId}/visibility`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                showToast('Cập nhật hiển thị thành công!', 'success');
                fetchProducts();
            } else {
                showToast(data.message || 'Không thể cập nhật', 'error');
            }
        } catch (error) {
            console.error('Error toggling visibility:', error);
            showToast('Lỗi khi cập nhật', 'error');
        }
    };

    const handleViewClick = (product) => {
        setViewingProduct(product);
        setShowViewModal(true);
    };

    return (
        <div className="ap-admin-page-container">
            <div className="ap-admin-page-header">
                <h2 className="ap-admin-page-title">Quản Lý Sản Phẩm</h2>
                <div className="ap-admin-page-actions">
                    <div className="ap-search-bar">
                        <FontAwesomeIcon icon={faSearch} className="ap-search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm sản phẩm..." 
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <button className="ap-btn-primary" onClick={() => setShowAddModal(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Thêm Sản Phẩm</span>
                    </button>
                    <button className="ap-btn-excel" onClick={handleExportExcel}>
                        <FontAwesomeIcon icon={faFileExcel} />
                        <span>Xuất Excel</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="ap-loading">Đang tải...</div>
            ) : (
                <>
                    <div className="ap-products-table-container">
                        <table className="ap-products-table">
                            <thead>
                                <tr>
                                    <th>Mã SP</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th>Danh Mục</th>
                                    <th>Mô Tả</th>
                                    <th>Giá</th>
                                    <th>Số Lượng</th>
                                    <th>Trạng Thái</th>
                                    <th>Hiển Thị</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td className="ap-product-code-cell">
                                            <span className="ap-product-code">{product.code}</span>
                                        </td>
                                        <td className="ap-product-name-cell" title={product.name}>
                                            {product.name}
                                        </td>
                                        <td>
                                            <span className={`ap-category-badge ${getCategoryClass(product.category)}`}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="ap-description-cell" title={product.description}>
                                            {product.description || '—'}
                                        </td>
                                        <td className="ap-price-cell">
                                            {product.price.toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="ap-stock-cell">
                                            <span className={`ap-stock-badge ${getStockClass(product.stock)}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`ap-status-badge ${getStatusClass(product.status)}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className={`ap-visibility-btn ${getVisibilityClass(product.visibility)}`}
                                                onClick={() => handleToggleVisibility(product.id)}
                                                title={product.visibility === 'Hiển thị' ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm'}
                                            >
                                                <FontAwesomeIcon icon={product.visibility === 'Hiển thị' ? faEye : faEyeSlash} />
                                            </button>
                                        </td>
                                        <td className="ap-action-cell">
                                            <button 
                                                className="ap-btn-action ap-btn-info"
                                                onClick={() => handleViewClick(product)}
                                                title="Xem chi tiết"
                                            >
                                                <FontAwesomeIcon icon={faInfo} />
                                            </button>
                                            <button 
                                                className="ap-btn-action ap-btn-edit"
                                                onClick={() => handleEditClick(product)}
                                                title="Chỉnh sửa"
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                            <button 
                                                className="ap-btn-action ap-btn-delete"
                                                onClick={() => handleDeleteProduct(product.id)}
                                                title="Xóa"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="ap-pagination">
                        <button 
                            className="ap-pagination-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`ap-pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            className="ap-pagination-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </button>
                    </div>
                </>
            )}

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="ap-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="ap-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h3>Thêm Sản Phẩm Mới</h3>
                            <button className="ap-modal-close" onClick={() => setShowAddModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="ap-modal-body">
                            <div className="ap-form-group">
                                <label>Tên Sản Phẩm <span className="ap-required">*</span></label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={newProduct.name}
                                    onChange={(e) => handleInputChange(e)}
                                    placeholder="Whey Protein..."
                                />
                            </div>
                            <div className="ap-form-group">
                                <label>Danh Mục</label>
                                <select 
                                    name="category"
                                    value={newProduct.category}
                                    onChange={(e) => handleInputChange(e)}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ap-form-group">
                                <label>Mô Tả</label>
                                <textarea 
                                    name="description"
                                    value={newProduct.description}
                                    onChange={(e) => handleInputChange(e)}
                                    rows="3"
                                    placeholder="Mô tả sản phẩm..."
                                ></textarea>
                            </div>
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label>Giá (VNĐ) <span className="ap-required">*</span></label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        value={newProduct.price}
                                        onChange={(e) => handleInputChange(e)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label>Số Lượng</label>
                                    <input 
                                        type="number" 
                                        name="stock"
                                        value={newProduct.stock}
                                        onChange={(e) => handleInputChange(e)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="ap-form-group">
                                <label>Hình Ảnh Sản Phẩm</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="ap-file-input"
                                />
                                {imagePreview && (
                                    <div className="ap-image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                    </div>
                                )}
                                {uploading && <p className="ap-uploading">Đang upload...</p>}
                            </div>
                            <div className="ap-form-group">
                                <label>Hiển Thị</label>
                                <select 
                                    name="visibility"
                                    value={newProduct.visibility}
                                    onChange={(e) => handleInputChange(e)}
                                >
                                    <option value="Hiển thị">Hiển thị</option>
                                    <option value="Ẩn">Ẩn</option>
                                </select>
                            </div>
                        </div>
                        <div className="ap-modal-footer">
                            <button className="ap-btn-secondary" onClick={() => setShowAddModal(false)}>
                                Hủy
                            </button>
                            <button className="ap-btn-primary" onClick={handleAddProduct}>
                                Thêm Sản Phẩm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && editingProduct && (
                <div className="ap-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="ap-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h3>Chỉnh Sửa Sản Phẩm</h3>
                            <button className="ap-modal-close" onClick={() => setShowEditModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="ap-modal-body">
                            <div className="ap-form-group">
                                <label>Mã Sản Phẩm <span className="ap-required">*</span></label>
                                <input 
                                    type="text" 
                                    name="code"
                                    value={editingProduct.code}
                                    onChange={(e) => handleInputChange(e, true)}
                                />
                            </div>
                            <div className="ap-form-group">
                                <label>Tên Sản Phẩm <span className="ap-required">*</span></label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={editingProduct.name}
                                    onChange={(e) => handleInputChange(e, true)}
                                />
                            </div>
                            <div className="ap-form-group">
                                <label>Danh Mục</label>
                                <select 
                                    name="category"
                                    value={editingProduct.category}
                                    onChange={(e) => handleInputChange(e, true)}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ap-form-group">
                                <label>Mô Tả</label>
                                <textarea 
                                    name="description"
                                    value={editingProduct.description || ''}
                                    onChange={(e) => handleInputChange(e, true)}
                                    rows="3"
                                ></textarea>
                            </div>
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label>Giá (VNĐ) <span className="ap-required">*</span></label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        value={editingProduct.price}
                                        onChange={(e) => handleInputChange(e, true)}
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label>Số Lượng</label>
                                    <input 
                                        type="number" 
                                        name="stock"
                                        value={editingProduct.stock}
                                        onChange={(e) => handleInputChange(e, true)}
                                    />
                                </div>
                            </div>
                            <div className="ap-form-group">
                                <label>Hình Ảnh Sản Phẩm</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="ap-file-input"
                                />
                                {imagePreview ? (
                                    <div className="ap-image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                    </div>
                                ) : editingProduct.image_url && (
                                    <div className="ap-image-preview">
                                        <img src={editingProduct.image_url} alt="Current" />
                                        <p className="ap-current-image-label">Ảnh hiện tại</p>
                                    </div>
                                )}
                                {uploading && <p className="ap-uploading">Đang upload...</p>}
                            </div>
                            <div className="ap-form-group">
                                <label>Hiển Thị</label>
                                <select 
                                    name="visibility"
                                    value={editingProduct.visibility}
                                    onChange={(e) => handleInputChange(e, true)}
                                >
                                    <option value="Hiển thị">Hiển thị</option>
                                    <option value="Ẩn">Ẩn</option>
                                </select>
                            </div>
                        </div>
                        <div className="ap-modal-footer">
                            <button className="ap-btn-secondary" onClick={() => setShowEditModal(false)}>
                                Hủy
                            </button>
                            <button className="ap-btn-primary" onClick={handleUpdateProduct}>
                                Cập Nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Product Modal */}
            {showViewModal && viewingProduct && (
                <div className="ap-modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="ap-modal-content ap-view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h3>Chi Tiết Sản Phẩm</h3>
                            <button className="ap-modal-close" onClick={() => setShowViewModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="ap-modal-body">
                            <div className="ap-view-grid">
                                <div className="ap-view-image">
                                    <img src={viewingProduct.image_url || 'https://placehold.co/300x300'} alt={viewingProduct.name} />
                                </div>
                                <div className="ap-view-info">
                                    <div className="ap-view-field">
                                        <label>Mã sản phẩm:</label>
                                        <span>{viewingProduct.code}</span>
                                    </div>
                                    <div className="ap-view-field">
                                        <label>Tên sản phẩm:</label>
                                        <span>{viewingProduct.name}</span>
                                    </div>
                                    <div className="ap-view-field">
                                        <label>Danh mục:</label>
                                        <span className={`ap-category-badge ${getCategoryClass(viewingProduct.category)}`}>
                                            {viewingProduct.category}
                                        </span>
                                    </div>
                                    <div className="ap-view-field">
                                        <label>Giá:</label>
                                        <span className="ap-view-price">{viewingProduct.price.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="ap-view-field">
                                        <label>Số lượng:</label>
                                        <span className={`ap-stock-badge ${getStockClass(viewingProduct.stock)}`}>
                                            {viewingProduct.stock}
                                        </span>
                                    </div>
                                    <div className="ap-view-field">
                                        <label>Trạng thái:</label>
                                        <span className={`ap-status-badge ${getStatusClass(viewingProduct.status)}`}>
                                            {viewingProduct.status}
                                        </span>
                                    </div>
                                    <div className="ap-view-field">
                                        <label>Hiển thị:</label>
                                        <span className={`ap-visibility-badge ${getVisibilityClass(viewingProduct.visibility)}`}>
                                            {viewingProduct.visibility}
                                        </span>
                                    </div>
                                    <div className="ap-view-field ap-view-description">
                                        <label>Mô tả:</label>
                                        <p>{viewingProduct.description || 'Không có mô tả'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ap-modal-footer">
                            <button className="ap-btn-secondary" onClick={() => setShowViewModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
