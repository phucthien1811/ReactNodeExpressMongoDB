import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faToggleOn, 
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import './css/AdminVoucher.css';

export default function AdminVoucher() {
  const { showSuccess, showError, showWarning } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: 0,
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filterActive !== 'all') {
        params.append('is_active', filterActive === 'active');
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`http://localhost:4000/api/v1/vouchers?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setVouchers(data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterActive]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 9; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingVoucher 
        ? `http://localhost:4000/api/v1/vouchers/${editingVoucher.id}`
        : 'http://localhost:4000/api/v1/vouchers';
      
      const method = editingVoucher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        showSuccess(data.message);
        setShowCreateModal(false);
        setEditingVoucher(null);
        resetForm();
        fetchVouchers();
      } else {
        showError(data.message);
      }
    } catch (error) {
      showError('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/v1/vouchers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        showSuccess(data.message);
        fetchVouchers();
      } else {
        showError(data.message);
      }
    } catch (error) {
      showError('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/v1/vouchers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      const data = await response.json();
      if (data.success) {
        showSuccess(currentStatus ? 'Đã vô hiệu hóa voucher' : 'Đã kích hoạt voucher');
        fetchVouchers();
      } else {
        showError(data.message);
      }
    } catch (error) {
      showError('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      min_order_value: voucher.min_order_value,
      max_discount: voucher.max_discount || '',
      usage_limit: voucher.usage_limit || '',
      valid_from: new Date(voucher.valid_from).toISOString().slice(0, 16),
      valid_until: new Date(voucher.valid_until).toISOString().slice(0, 16),
      is_active: voucher.is_active
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: 0,
      max_discount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="admin__section voucher-management">
      <div className="admin__section-head">
        <h2 className="admin__title">Quản Lý Voucher</h2>
        <button 
          className="btn-create-voucher"
          onClick={() => {
            setEditingVoucher(null);
            resetForm();
            setShowCreateModal(true);
          }}
        >
          + Tạo Voucher Mới
        </button>
      </div>

      {/* Filters */}
      <div className="voucher-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hoặc tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchVouchers} className="btn-search">Tìm</button>
        </div>
        
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select 
            value={filterActive} 
            onChange={(e) => setFilterActive(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã vô hiệu hóa</option>
          </select>
        </div>
      </div>

      {/* Voucher List */}
      <div className="admin__table-wrap">
        {loading ? (
          <p className="loading-text">Đang tải...</p>
        ) : vouchers.length === 0 ? (
          <p className="empty-text">Chưa có voucher nào</p>
        ) : (
          <table className="voucher-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đã dùng</th>
                <th>Hiệu lực</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(voucher => (
                <tr key={voucher.id}>
                  <td><code className="voucher-code">{voucher.code}</code></td>
                  <td>{voucher.name}</td>
                  <td>
                    {voucher.discount_type === 'percentage' ? 'Phần trăm' : 'Cố định'}
                  </td>
                  <td>
                    {voucher.discount_type === 'percentage' 
                      ? `${voucher.discount_value}%${voucher.discount_value === 100 ? ' (Miễn phí)' : ''}` 
                      : formatCurrency(voucher.discount_value)
                    }
                    {voucher.max_discount && voucher.discount_type === 'percentage' && (
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        Tối đa: {formatCurrency(voucher.max_discount)}
                      </div>
                    )}
                  </td>
                  <td>
                    {voucher.used_count}
                    {voucher.usage_limit && ` / ${voucher.usage_limit}`}
                  </td>
                  <td className="date-range">
                    <div>{formatDate(voucher.valid_from)}</div>
                    <div>đến {formatDate(voucher.valid_until)}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${voucher.is_active ? 'active' : 'inactive'}`}>
                      {voucher.is_active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => handleEdit(voucher)}
                      className="btn-action edit"
                      title="Chỉnh sửa"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(voucher.id, voucher.is_active)}
                      className="btn-action toggle"
                      title={voucher.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    >
                      <FontAwesomeIcon icon={voucher.is_active ? faToggleOn : faToggleOff} />
                    </button>
                    <button 
                      onClick={() => handleDelete(voucher.id)}
                      className="btn-action delete"
                      title="Xóa"
                      disabled={voucher.used_count > 0}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVoucher ? 'Chỉnh Sửa Voucher' : 'Tạo Voucher Mới'}</h3>
              <button 
                className="btn-close"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingVoucher(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            {!editingVoucher && (
              <div style={{
                margin: '16px 24px 0',
                padding: '12px 16px',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#0c4a6e'
              }}>
                <strong>💡 Ví dụ voucher:</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                  <li><strong>Giảm 50%:</strong> discount_type=percentage, discount_value=50, max_discount=200000 → Giảm 50% nhưng tối đa 200k</li>
                  <li><strong>Miễn phí:</strong> discount_type=percentage, discount_value=100, để trống max_discount → Giảm 100%</li>
                  <li><strong>Giảm 100k:</strong> discount_type=fixed, discount_value=100000 → Giảm cố định 100k</li>
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="voucher-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Mã Voucher (9 ký tự) *</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      maxLength={9}
                      required
                      disabled={editingVoucher}
                    />
                    {!editingVoucher && (
                      <button type="button" onClick={generateCode} className="btn-generate">
                        Tạo ngẫu nhiên
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Tên Voucher *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại giảm giá *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    required
                  >
                    <option value="percentage">Phần trăm (%) - Có thể giảm 100% = miễn phí</option>
                    <option value="fixed">Số tiền cố định (VND) - Giảm trừ số tiền</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Giá trị giảm * 
                    {formData.discount_type === 'percentage' 
                      ? ' (0-100% | VD: 100 = miễn phí hoàn toàn)' 
                      : ' (VND | VD: 100000 = giảm 100k)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    min="0"
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    step={formData.discount_type === 'percentage' ? '0.01' : '1000'}
                    placeholder={formData.discount_type === 'percentage' ? 'VD: 100 (= 100%)' : 'VD: 100000'}
                    required
                  />
                  {formData.discount_type === 'percentage' && formData.discount_value === '100' && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '8px 12px', 
                      background: '#fef3c7', 
                      border: '1px solid #fbbf24', 
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#92400e'
                    }}>
                      ⚠️ Voucher này sẽ giảm 100% - Khách hàng không phải trả tiền (0đ)
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Đơn hàng tối thiểu (VND)</label>
                  <input
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                    min="0"
                    step="1000"
                    placeholder="VD: 100000 (khách phải mua tối thiểu 100k)"
                  />
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Để 0 = không yêu cầu đơn hàng tối thiểu
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Giảm tối đa (VND) 
                    {formData.discount_type === 'percentage' 
                      ? ' - Chỉ cho voucher %' 
                      : ' - Không áp dụng cho số tiền cố định'}
                  </label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    min="0"
                    step="1000"
                    placeholder="VD: 200000 (giảm tối đa 200k)"
                    disabled={formData.discount_type === 'fixed'}
                  />
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {formData.discount_type === 'percentage' 
                      ? 'Để trống = không giới hạn số tiền giảm tối đa'
                      : 'Không cần thiết cho voucher cố định'}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Giới hạn sử dụng (để trống = không giới hạn)</label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  min="1"
                  step="1"
                  placeholder="VD: 100 (chỉ 100 người dùng được)"
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Số lần voucher có thể được sử dụng. Để trống = vô hạn
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày hết hạn *</label>
                  <input
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Kích hoạt ngay
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingVoucher(null);
                    resetForm();
                  }}
                  className="btn-cancel"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : (editingVoucher ? 'Cập nhật' : 'Tạo voucher')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

