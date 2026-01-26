import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faFilter, 
    faPlus, 
    faPen, 
    faTrash, 
    faChevronLeft, 
    faChevronRight,
    faToggleOn,
    faToggleOff,
    faTimes,
    faFileExcel,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import './css/AdminMembers.css';
import { useToast } from '../../context/ToastContext';

export default function AdminMembers() {
    const { showSuccess, showError } = useToast();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberDetail, setMemberDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    
    const [newMember, setNewMember] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'member'
    });

    // Fetch members từ API
    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                status: statusFilter
            });

            const response = await fetch(`/api/v1/users?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            if (data.success) {
                setMembers(data.data || []);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination?.total || 0,
                    totalPages: data.pagination?.totalPages || 0
                }));
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            showError('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchTerm, statusFilter, showError]);

    // Fetch stats từ API
    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch stats');

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
        fetchStats();
    }, [fetchMembers, fetchStats]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMember(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddMember = async () => {
        if (!newMember.name || !newMember.email || !newMember.password) {
            showError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newMember)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create user');
            }

            showSuccess('Thêm người dùng thành công!');
            setNewMember({
                name: '',
                email: '',
                password: '',
                phone: '',
                role: 'member'
            });
            setShowAddModal(false);
            fetchMembers();
            fetchStats();
        } catch (error) {
            showError(error.message || 'Có lỗi xảy ra khi thêm người dùng');
        }
    };

    const handleEditClick = (member) => {
        setEditingMember({
            id: member.id,
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            role: member.role,
            password: ''
        });
        setShowEditModal(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingMember(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleViewDetail = async (member) => {
        setSelectedMember(member);
        setShowDetailModal(true);
        setDetailLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/users/${member.id}/detail`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setMemberDetail(data.data);
            } else {
                showError('Không thể tải thông tin chi tiết');
            }
        } catch (error) {
            console.error('Error fetching member detail:', error);
            showError('Có lỗi xảy ra khi tải thông tin');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleUpdateMember = async () => {
        if (!editingMember.name || !editingMember.email) {
            showError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const updateData = {
                name: editingMember.name,
                email: editingMember.email,
                phone: editingMember.phone,
                role: editingMember.role
            };

            // Chỉ gửi password nếu có nhập
            if (editingMember.password && editingMember.password.trim()) {
                updateData.password = editingMember.password;
            }

            const response = await fetch(`/api/v1/users/${editingMember.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update user');
            }

            showSuccess('Cập nhật người dùng thành công!');
            setShowEditModal(false);
            setEditingMember(null);
            fetchMembers();
        } catch (error) {
            showError(error.message || 'Có lỗi xảy ra khi cập nhật người dùng');
        }
    };

    const handleDeleteUser = async (member) => {
        if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${member.name}"?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/users/${member.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to delete user');
            }

            showSuccess('Xóa người dùng thành công!');
            fetchMembers();
            fetchStats();
        } catch (error) {
            showError(error.message || 'Không thể xóa người dùng');
        }
    };

    const handleToggleStatus = async (member) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/users/${member.id}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to toggle status');
            }

            showSuccess(data.data.is_active ? 'Đã kích hoạt người dùng' : 'Đã tắt người dùng');
            fetchMembers();
            fetchStats();
        } catch (error) {
            showError(error.message || 'Không thể thay đổi trạng thái');
        }
    };

    // Helper functions - Định nghĩa trước để sử dụng trong handleExportExcel
    const getRoleName = (role) => {
        switch (role) {
            case 'admin': return 'Quản trị viên';
            case 'trainer': return 'Huấn luyện viên';
            case 'member': return 'Hội viên';
            default: return role;
        }
    };

    const getStatusClass = (isActive) => {
        return isActive ? 'am-status-active' : 'am-status-expired';
    };

    const getAvatarPlaceholder = (name) => {
        if (!name) return 'U';
        
        const nameParts = name.trim().split(' ').filter(part => part.length > 0);
        
        if (nameParts.length === 1) {
            // Nếu chỉ có 1 từ, lấy 2 chữ cái đầu
            return name.substring(0, 2).toUpperCase();
        } else {
            // Nếu có nhiều từ, lấy chữ cái đầu của 2 từ đầu tiên
            return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
        }
    };

    const handleExportExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams({
                search: searchTerm,
                status: statusFilter
            });

            const response = await fetch(`/api/v1/users/export?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to export data');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showSuccess('Xuất file Excel thành công!');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            showError(error.message || 'Không thể xuất file Excel');
        }
    };

    if (loading && members.length === 0) {
        return (
            <div className="am-admin-page-container">
                <div className="loading-spinner">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="am-admin-page-container">
            {/* Header */}
            <div className="am-admin-page-header">
                <h3 className="am-admin-page-title">Quản Lý Người Dùng</h3>
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
                    <div>
                        <span style={{ color: '#6b7280' }}>Tổng: </span>
                        <strong>{stats.total || 0}</strong>
                    </div>
                    <div>
                        <span style={{ color: '#6b7280' }}>Hoạt động: </span>
                        <strong style={{ color: '#10b981' }}>{stats.active || 0}</strong>
                    </div>
                    <div>
                        <span style={{ color: '#6b7280' }}>Tắt: </span>
                        <strong style={{ color: '#ef4444' }}>{stats.inactive || 0}</strong>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="am-admin-page-actions">
                <div className="am-search-bar">
                    <FontAwesomeIcon icon={faSearch} className="am-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên, email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    />
                </div>
                <div className="am-filter-group">
                    <FontAwesomeIcon icon={faFilter} className="am-filter-icon" />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Đã tắt</option>
                    </select>
                </div>
                <button className="am-btn-primary" onClick={() => setShowAddModal(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Thêm Người Dùng</span>
                </button>
            </div>

            {/* Table */}
            <div className="am-admin-table-container">
                <table className="am-admin-table">
                    <thead>
                        <tr>
                            <th>Người Dùng</th>
                            <th>Vai Trò</th>
                            <th>Số Điện Thoại</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id}>
                                    <td>
                                        <div className="am-user-info-cell">
                                            {member.avatar_url ? (
                                                <img 
                                                    src={member.avatar_url} 
                                                    alt={member.name} 
                                                    className="am-user-avatar"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div 
                                                className="am-user-avatar" 
                                                style={{ 
                                                    background: '#43a047', 
                                                    color: 'white', 
                                                    display: member.avatar_url ? 'none' : 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {getAvatarPlaceholder(member.name)}
                                            </div>
                                            <div className="am-user-details">
                                                <span className="am-user-name">{member.name}</span>
                                                <span className="am-user-email">{member.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{getRoleName(member.role)}</td>
                                    <td>{member.phone || '-'}</td>
                                    <td>
                                        <span className={`am-status-pill ${getStatusClass(member.is_active)}`}>
                                            {member.is_active ? 'Có' : 'Không'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="am-action-buttons">
                                            <button 
                                                className="am-action-btn am-btn-view" 
                                                title="Xem chi tiết" 
                                                onClick={() => handleViewDetail(member)}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button 
                                                className={`am-action-btn am-btn-toggle ${!member.is_active ? 'am-disabled' : ''}`}
                                                title={member.is_active ? 'Tắt trạng thái' : 'Bật trạng thái'}
                                                onClick={() => handleToggleStatus(member)}
                                            >
                                                <FontAwesomeIcon icon={member.is_active ? faToggleOn : faToggleOff} />
                                            </button>
                                            <button 
                                                className="am-action-btn am-btn-edit" 
                                                title="Chỉnh sửa" 
                                                onClick={() => handleEditClick(member)}
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                            <button 
                                                className="am-action-btn am-btn-delete" 
                                                title="Xóa"
                                                onClick={() => handleDeleteUser(member)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="am-pagination-container">
                <button className="am-btn-export-excel" onClick={handleExportExcel}>
                    <FontAwesomeIcon icon={faFileExcel} />
                    <span>Xuất Excel</span>
                </button>
                <div className="am-pagination-controls">
                    <button 
                        className="am-pagination-btn" 
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <span className="am-page-number am-active">{pagination.page}</span>
                    <button 
                        className="am-pagination-btn"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>

            {/* Modal Thêm Người Dùng */}
            {showAddModal && (
                <div className="am-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="am-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="am-modal-header">
                            <h3>Thêm Người Dùng Mới</h3>
                            <button 
                                className="am-modal-close"
                                onClick={() => setShowAddModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="am-modal-body">
                            <div className="am-form-group">
                                <label>Họ và tên <span className="am-required">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newMember.name}
                                    onChange={handleInputChange}
                                    placeholder="Nhập họ và tên"
                                    required
                                />
                            </div>

                            <div className="am-form-group">
                                <label>Email <span className="am-required">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newMember.email}
                                    onChange={handleInputChange}
                                    placeholder="Nhập email"
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            <div className="am-form-group">
                                <label>Mật khẩu <span className="am-required">*</span></label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newMember.password}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="am-form-row">
                                <div className="am-form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={newMember.phone}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                <div className="am-form-group">
                                    <label>Vai trò</label>
                                    <select
                                        name="role"
                                        value={newMember.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="member">Hội viên</option>
                                        <option value="trainer">Huấn luyện viên</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="am-modal-footer">
                            <button 
                                className="am-btn-secondary"
                                onClick={() => setShowAddModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="am-btn-submit"
                                onClick={handleAddMember}
                            >
                                Thêm Người Dùng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Chỉnh Sửa Người Dùng */}
            {showEditModal && editingMember && (
                <div className="am-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="am-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="am-modal-header">
                            <h3>Chỉnh Sửa Người Dùng</h3>
                            <button 
                                className="am-modal-close"
                                onClick={() => setShowEditModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="am-modal-body">
                            <div className="am-form-group">
                                <label>Họ và tên <span className="am-required">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editingMember.name}
                                    onChange={handleEditInputChange}
                                    placeholder="Nhập họ và tên"
                                    required
                                />
                            </div>

                            <div className="am-form-group">
                                <label>Email <span className="am-required">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editingMember.email}
                                    onChange={handleEditInputChange}
                                    placeholder="Nhập email"
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            <div className="am-form-group">
                                <label>Mật khẩu mới</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={editingMember.password}
                                    onChange={handleEditInputChange}
                                    placeholder="Để trống nếu không đổi mật khẩu"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="am-form-row">
                                <div className="am-form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editingMember.phone}
                                        onChange={handleEditInputChange}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                <div className="am-form-group">
                                    <label>Vai trò</label>
                                    <select
                                        name="role"
                                        value={editingMember.role}
                                        onChange={handleEditInputChange}
                                    >
                                        <option value="member">Hội viên</option>
                                        <option value="trainer">Huấn luyện viên</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="am-modal-footer">
                            <button 
                                className="am-btn-secondary"
                                onClick={() => setShowEditModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="am-btn-submit"
                                onClick={handleUpdateMember}
                            >
                                Cập Nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xem Chi Tiết Member */}
            {showDetailModal && selectedMember && (
                <div className="am-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="am-modal-content am-modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="am-modal-header">
                            <h3>Thông Tin Chi Tiết: {selectedMember.name}</h3>
                            <button 
                                className="am-modal-close"
                                onClick={() => setShowDetailModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="am-modal-body">
                            {detailLoading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    Đang tải thông tin...
                                </div>
                            ) : memberDetail ? (
                                <div className="am-detail-container">
                                    {/* Thông tin cơ bản */}
                                    <div className="am-detail-section">
                                        <h4 className="am-section-title">Thông Tin Cơ Bản</h4>
                                        <div className="am-info-grid">
                                            <div className="am-info-item">
                                                <span className="am-info-label">Họ tên:</span>
                                                <span className="am-info-value">{memberDetail.user.name}</span>
                                            </div>
                                            <div className="am-info-item">
                                                <span className="am-info-label">Email:</span>
                                                <span className="am-info-value">{memberDetail.user.email}</span>
                                            </div>
                                            <div className="am-info-item">
                                                <span className="am-info-label">Số điện thoại:</span>
                                                <span className="am-info-value">{memberDetail.profile?.phone || '-'}</span>
                                            </div>
                                            <div className="am-info-item">
                                                <span className="am-info-label">Vai trò:</span>
                                                <span className="am-info-value">{getRoleName(memberDetail.user.role)}</span>
                                            </div>
                                            <div className="am-info-item">
                                                <span className="am-info-label">Trạng thái:</span>
                                                <span className={`am-status-pill ${getStatusClass(memberDetail.user.is_active)}`}>
                                                    {memberDetail.user.is_active ? 'Hoạt động' : 'Đã tắt'}
                                                </span>
                                            </div>
                                            <div className="am-info-item">
                                                <span className="am-info-label">Ngày tạo tài khoản:</span>
                                                <span className="am-info-value">
                                                    {memberDetail.user.created_at 
                                                        ? new Date(memberDetail.user.created_at).toLocaleDateString('vi-VN')
                                                        : '-'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin profile */}
                                    {memberDetail.profile && (
                                        <div className="am-detail-section">
                                            <h4 className="am-section-title">Thông Tin Profile</h4>
                                            <div className="am-info-grid">
                                                <div className="am-info-item">
                                                    <span className="am-info-label">Ngày sinh:</span>
                                                    <span className="am-info-value">
                                                        {memberDetail.profile.birth_date 
                                                            ? new Date(memberDetail.profile.birth_date).toLocaleDateString('vi-VN')
                                                            : '-'
                                                        }
                                                    </span>
                                                </div>
                                                <div className="am-info-item">
                                                    <span className="am-info-label">Giới tính:</span>
                                                    <span className="am-info-value">
                                                        {memberDetail.profile.gender === 'male' ? 'Nam' : 
                                                         memberDetail.profile.gender === 'female' ? 'Nữ' : 
                                                         memberDetail.profile.gender === 'other' ? 'Khác' : '-'}
                                                    </span>
                                                </div>
                                                <div className="am-info-item">
                                                    <span className="am-info-label">Chiều cao:</span>
                                                    <span className="am-info-value">
                                                        {memberDetail.profile.height ? `${memberDetail.profile.height} cm` : '-'}
                                                    </span>
                                                </div>
                                                <div className="am-info-item">
                                                    <span className="am-info-label">Cân nặng:</span>
                                                    <span className="am-info-value">
                                                        {memberDetail.profile.weight ? `${memberDetail.profile.weight} kg` : '-'}
                                                    </span>
                                                </div>
                                                <div className="am-info-item" style={{ gridColumn: '1 / -1' }}>
                                                    <span className="am-info-label">Địa chỉ:</span>
                                                    <span className="am-info-value">{memberDetail.profile.address || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Gói tập đã đăng ký */}
                                    <div className="am-detail-section">
                                        <h4 className="am-section-title">Gói Tập Đã Đăng Ký</h4>
                                        {memberDetail.packages && memberDetail.packages.length > 0 ? (
                                            <div className="am-packages-list">
                                                {memberDetail.packages.map((pkg, index) => (
                                                    <div key={index} className="am-package-card">
                                                        <div className="am-package-header">
                                                            <h5>{pkg.package_name}</h5>
                                                            <span className={`am-status-pill ${
                                                                pkg.status === 'active' ? 'am-status-active' : 'am-status-expired'
                                                            }`}>
                                                                {pkg.status_label}
                                                            </span>
                                                        </div>
                                                        <div className="am-package-info">
                                                            <div className="am-package-row">
                                                                <span>Ngày bắt đầu:</span>
                                                                <strong>{new Date(pkg.start_date).toLocaleDateString('vi-VN')}</strong>
                                                            </div>
                                                            <div className="am-package-row">
                                                                <span>Ngày kết thúc:</span>
                                                                <strong>{new Date(pkg.end_date).toLocaleDateString('vi-VN')}</strong>
                                                            </div>
                                                            <div className="am-package-row">
                                                                <span>Số ngày còn lại:</span>
                                                                <strong style={{ 
                                                                    color: pkg.remaining_days <= 7 ? '#ef4444' : 
                                                                           pkg.remaining_days <= 30 ? '#f59e0b' : '#22c55e'
                                                                }}>
                                                                    {pkg.is_expired ? '0 ngày (Đã hết hạn)' : `${pkg.remaining_days} ngày`}
                                                                </strong>
                                                            </div>
                                                            <div className="am-package-row">
                                                                <span>Giá trị:</span>
                                                                <strong>{parseFloat(pkg.price).toLocaleString('vi-VN')}đ</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                                Chưa đăng ký gói tập nào
                                            </div>
                                        )}
                                    </div>

                                    {/* Lịch sử giao dịch */}
                                    <div className="am-detail-section">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h4 className="am-section-title" style={{ margin: 0, border: 'none', paddingBottom: 0 }}>
                                                Lịch Sử Giao Dịch (10 gần nhất)
                                            </h4>
                                            {memberDetail.transactions && memberDetail.transactions.length > 0 && (
                                                <button
                                                    className="am-btn-export-small"
                                                    onClick={async () => {
                                                        try {
                                                            const token = localStorage.getItem('token');
                                                            const response = await fetch(`/api/v1/users/${selectedMember.id}/transactions/export`, {
                                                                headers: {
                                                                    'Authorization': `Bearer ${token}`
                                                                }
                                                            });

                                                            if (!response.ok) throw new Error('Export failed');

                                                            const blob = await response.blob();
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = `transactions_user_${selectedMember.id}_${new Date().toISOString().split('T')[0]}.xlsx`;
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            window.URL.revokeObjectURL(url);
                                                            document.body.removeChild(a);
                                                            showSuccess('Xuất Excel thành công!');
                                                        } catch (error) {
                                                            console.error('Export error:', error);
                                                            showError('Lỗi khi xuất Excel');
                                                        }
                                                    }}
                                                    title="Xuất tất cả giao dịch ra Excel"
                                                >
                                                    <FontAwesomeIcon icon={faFileExcel} /> Xuất Excel
                                                </button>
                                            )}
                                        </div>
                                        {memberDetail.transactions && memberDetail.transactions.length > 0 ? (
                                            <div className="am-table-container">
                                                <table className="am-simple-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Mã GD</th>
                                                            <th>Ngày giờ</th>
                                                            <th>Loại</th>
                                                            <th>Số tiền</th>
                                                            <th>Phương thức</th>
                                                            <th>Trạng thái</th>
                                                            <th>Chi tiết</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {memberDetail.transactions.map((trx) => (
                                                            <tr key={trx.id}>
                                                                <td>
                                                                    <strong>#{trx.id}</strong>
                                                                    <br />
                                                                    <small style={{ color: '#9ca3af' }}>{trx.txn_ref}</small>
                                                                </td>
                                                                <td>
                                                                    {new Date(trx.created_at).toLocaleDateString('vi-VN')}
                                                                    <br />
                                                                    <small style={{ color: '#9ca3af' }}>
                                                                        {new Date(trx.created_at).toLocaleTimeString('vi-VN')}
                                                                    </small>
                                                                </td>
                                                                <td>
                                                                    {trx.type_display}
                                                                    <br />
                                                                    {trx.type === 'package' && trx.package_name && (
                                                                        <small style={{ color: '#9ca3af' }}>{trx.package_name}</small>
                                                                    )}
                                                                </td>
                                                                <td><strong>{parseFloat(trx.amount).toLocaleString('vi-VN')}đ</strong></td>
                                                                <td>{trx.bank_code_display}</td>
                                                                <td>
                                                                    <span className={`am-status-pill ${
                                                                        trx.status === 'success' ? 'am-status-active' : 
                                                                        trx.status === 'pending' ? 'am-status-pending' : 
                                                                        'am-status-expired'
                                                                    }`}>
                                                                        {trx.status_display}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {trx.type === 'order' && trx.order_id && (
                                                                        <button
                                                                            className="am-btn-icon"
                                                                            onClick={() => {
                                                                                setSelectedOrder({
                                                                                    order_number: trx.order_number,
                                                                                    order_id: trx.order_id,
                                                                                    amount: trx.order_amount || trx.amount,
                                                                                    created_at: trx.created_at,
                                                                                    payment_method: trx.bank_code_display
                                                                                });
                                                                                setShowOrderDetailModal(true);
                                                                            }}
                                                                            title="Xem chi tiết đơn hàng"
                                                                        >
                                                                            <FontAwesomeIcon icon={faEye} />
                                                                        </button>
                                                                    )}
                                                                    {trx.type === 'package' && (
                                                                        <span style={{ color: '#9ca3af' }}>-</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                                Chưa có giao dịch nào
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    Không có dữ liệu
                                </div>
                            )}
                        </div>

                        <div className="am-modal-footer">
                            <button 
                                className="am-btn-secondary"
                                onClick={() => setShowDetailModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Chi Tiết Đơn Hàng */}
            {showOrderDetailModal && selectedOrder && (
                <div className="am-modal-overlay" onClick={() => setShowOrderDetailModal(false)}>
                    <div className="am-modal-content am-modal-small" onClick={(e) => e.stopPropagation()}>
                        <div className="am-modal-header">
                            <h3>Chi Tiết Đơn Hàng</h3>
                            <button 
                                className="am-modal-close"
                                onClick={() => setShowOrderDetailModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="am-modal-body">
                            <div className="am-order-detail-container">
                                <div className="am-order-info-row">
                                    <span className="am-order-label">Mã đơn hàng:</span>
                                    <span className="am-order-value">
                                        <strong>{selectedOrder.order_number}</strong>
                                    </span>
                                </div>
                                <div className="am-order-info-row">
                                    <span className="am-order-label">ID đơn hàng:</span>
                                    <span className="am-order-value">#{selectedOrder.order_id}</span>
                                </div>
                                <div className="am-order-info-row">
                                    <span className="am-order-label">Ngày đặt:</span>
                                    <span className="am-order-value">
                                        {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <div className="am-order-info-row">
                                    <span className="am-order-label">Tổng tiền:</span>
                                    <span className="am-order-value" style={{ color: '#22c55e', fontWeight: 'bold' }}>
                                        {parseFloat(selectedOrder.amount).toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                                <div className="am-order-info-row">
                                    <span className="am-order-label">Phương thức thanh toán:</span>
                                    <span className="am-order-value">{selectedOrder.payment_method}</span>
                                </div>
                            </div>
                        </div>

                        <div className="am-modal-footer">
                            <button 
                                className="am-btn-secondary"
                                onClick={() => setShowOrderDetailModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
