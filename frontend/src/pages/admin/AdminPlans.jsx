import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash, faCheckCircle, faEye, faEyeSlash, faUsers, faSearch, faFileExcel, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../context/ToastContext';
import './css/AdminPlans.css';

const AdminPlans = () => {
    const { showSuccess, showError } = useToast();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [currentPackage, setCurrentPackage] = useState(null);
    const [packageMembers, setPackageMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [freeNotes, setFreeNotes] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration_days: '',
        features: [''],
        is_published: false
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/v1/packages', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                // Parse features từ JSON string
                const packagesWithParsedFeatures = data.data.map(pkg => ({
                    ...pkg,
                    features: typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features
                }));
                setPackages(packagesWithParsedFeatures);
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = currentPackage ? 'PUT' : 'POST';
        const url = currentPackage ? `http://localhost:4000/api/v1/packages/${currentPackage.id}` : 'http://localhost:4000/api/v1/packages';
        
        const submitData = {
            ...formData,
            price: parseFloat(formData.price),
            duration_days: parseInt(formData.duration_days),
            features: formData.features.filter(f => f.trim() !== '').length > 0 
                ? formData.features.filter(f => f.trim() !== '')
                : ['Gói tập cơ bản'] // Default feature nếu không có
        };

        try {
            console.log('Submitting data:', submitData);
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                showSuccess('Lưu gói tập thành công!');
                setShowModal(false);
                setCurrentPackage(null);
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    duration_days: '',
                    features: [''],
                    is_published: false
                });
                fetchPackages();
            } else {
                showError(data.message || 'Có lỗi xảy ra khi lưu gói tập');
            }
        } catch (error) {
            console.error('Error saving package:', error);
            showError('Có lỗi xảy ra khi lưu gói tập');
        }
    };

    const handleEdit = (pkg) => {
        setCurrentPackage(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description || '',
            price: pkg.price.toString(),
            duration_days: pkg.duration_days.toString(),
            features: Array.isArray(pkg.features) ? pkg.features : [],
            is_published: Boolean(pkg.is_published) // Convert 0/1 to false/true
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa gói tập này?')) return;

        try {
            const response = await fetch(`http://localhost:4000/api/v1/packages/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                showSuccess('Xóa gói tập thành công!');
                fetchPackages();
            } else {
                showError(data.message || 'Có lỗi xảy ra khi xóa gói tập');
            }
        } catch (error) {
            console.error('Error deleting package:', error);
            showError('Có lỗi xảy ra khi xóa gói tập');
        }
    };

    const togglePublished = async (id) => {
        try {
            const response = await fetch(`http://localhost:4000/api/v1/packages/${id}/toggle-published`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                showSuccess(data.data.is_published ? 'Đã hiển thị gói tập' : 'Đã ẩn gói tập');
                fetchPackages();
            }
        } catch (error) {
            console.error('Error toggling published status:', error);
            showError('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const viewMembers = async (pkg) => {
        try {
            const response = await fetch(`http://localhost:4000/api/v1/packages/${pkg.id}/members`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                console.log('Package members data:', data.data); // Debug log
                setPackageMembers(data.data);
                setCurrentPackage(pkg);
                setShowMembersModal(true);
            }
        } catch (error) {
            console.error('Error fetching package members:', error);
        }
    };

    const handleExportMembers = async (packageId) => {
        try {
            showSuccess('Đang xuất Excel...');
            
            const response = await fetch(`http://localhost:4000/api/v1/packages/${packageId}/members/export`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ThanhVien_${currentPackage?.name}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showSuccess('✅ Xuất Excel thành công!');
        } catch (error) {
            console.error('Error exporting members:', error);
            showError('❌ Lỗi khi xuất Excel');
        }
    };

    const handleRemoveMember = async (memberPackageId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi gói?')) return;

        try {
            const response = await fetch(`http://localhost:4000/api/v1/member-packages/${memberPackageId}/remove`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                showSuccess('Xóa thành viên thành công!');
                // Refresh danh sách members
                viewMembers(currentPackage);
                // Refresh danh sách packages để cập nhật số lượng
                fetchPackages();
            } else {
                showError(data.message || 'Có lỗi xảy ra khi xóa thành viên');
            }
        } catch (error) {
            console.error('Error removing member:', error);
            showError('Có lỗi xảy ra khi xóa thành viên');
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/v1/users?limit=1000', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setAllUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAddMemberFree = async () => {
        if (!selectedUserId) {
            showError('Vui lòng chọn thành viên');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/api/v1/member-packages/add-free', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    user_id: selectedUserId,
                    package_id: currentPackage.id,
                    notes: freeNotes || 'Gói miễn phí được tặng bởi admin'
                })
            });

            const data = await response.json();
            if (data.success) {
                showSuccess('Thêm thành viên vào gói miễn phí thành công!');
                setShowAddMemberModal(false);
                setSelectedUserId('');
                setFreeNotes('');
                // Refresh danh sách members
                viewMembers(currentPackage);
                // Refresh danh sách packages để cập nhật số lượng
                fetchPackages();
            } else {
                showError(data.message || 'Có lỗi xảy ra khi thêm thành viên');
            }
        } catch (error) {
            console.error('Error adding member:', error);
            showError('Có lỗi xảy ra khi thêm thành viên');
        }
    };

    const openAddMemberModal = (pkg) => {
        setCurrentPackage(pkg);
        fetchAllUsers();
        setShowAddMemberModal(true);
    };

    const addFeatureField = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeatureField = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const updateFeature = (index, value) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map((feature, i) => i === index ? value : feature)
        }));
    };

    if (loading) return <div>Loading...</div>;

    // Filter packages based on search term
    const filteredPackages = packages.filter(pkg => 
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (Array.isArray(pkg.features) && pkg.features.some(feature => 
            feature.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản Lý Gói Thành Viên</h2>
            </div>

            {/* Search and Action Bar */}
            <div className="apl-search-action-bar">
                <div className="apl-search-input">
                    <FontAwesomeIcon icon={faSearch} className="apl-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm gói tập theo tên, mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    className="apl-btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Tạo Gói Mới</span>
                </button>
            </div>

            <div className="apl-plans-grid">
                {filteredPackages.map(pkg => (
                    <div key={pkg.id} className="apl-plan-card">
                        <div className="apl-plan-header">
                            <h3 className="apl-plan-name">{pkg.name}</h3>
                            <div className="apl-plan-actions">
                                <button 
                                    className="apl-action-btn apl-btn-info"
                                    onClick={() => viewMembers(pkg)}
                                    title="Xem thành viên"
                                >
                                    <FontAwesomeIcon icon={faUsers} />
                                    <span className="apl-member-count">{pkg.active_members || 0}</span>
                                </button>
                                <button 
                                    className="apl-action-btn btn-secondary"
                                    onClick={() => togglePublished(pkg.id)}
                                    title={pkg.is_published ? 'Ẩn gói' : 'Hiển thị gói'}
                                >
                                    <FontAwesomeIcon icon={pkg.is_published ? faEyeSlash : faEye} />
                                </button>
                                <button 
                                    className="action-btn btn-edit"
                                    onClick={() => handleEdit(pkg)}
                                >
                                    <FontAwesomeIcon icon={faPen} />
                                </button>
                                <button 
                                    className="action-btn btn-delete"
                                    onClick={() => handleDelete(pkg.id)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                        <div className="apl-plan-pricing">
                            <span className="apl-plan-price">{parseInt(pkg.price).toLocaleString('vi-VN')}đ</span>
                            <span className="apl-plan-duration">/ {Math.floor(pkg.duration_days / 30)} tháng</span>
                        </div>
                        <ul className="apl-plan-features">
                            {(Array.isArray(pkg.features) ? pkg.features : []).map((feature, index) => (
                                <li key={index}>
                                    <FontAwesomeIcon icon={faCheckCircle} /> 
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <div className="apl-plan-footer">
                            <span className={`apl-status-pill ${pkg.is_published ? 'apl-status-active' : 'apl-status-inactive'}`}>
                                {pkg.is_published ? 'Đang hiển thị' : 'Bản nháp'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Tạo/Sửa Package */}
            {showModal && (
                <div className="apl-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="apl-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="apl-modal-header">
                            <h3>{currentPackage ? 'Sửa Gói Tập' : 'Tạo Gói Tập Mới'}</h3>
                            <button 
                                className="apl-modal-close"
                                onClick={() => setShowModal(false)}
                            >×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="apl-form-group">
                                <label>Tên gói:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                                    required
                                />
                            </div>
                            <div className="apl-form-group">
                                <label>Mô tả:</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                                    rows="3"
                                />
                            </div>
                            <div className="apl-form-row">
                                <div className="apl-form-group">
                                    <label>Giá (VNĐ):</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData(prev => ({...prev, price: e.target.value}))}
                                        required
                                    />
                                </div>
                                <div className="apl-form-group">
                                    <label>Thời hạn (ngày):</label>
                                    <input
                                        type="number"
                                        value={formData.duration_days}
                                        onChange={e => setFormData(prev => ({...prev, duration_days: e.target.value}))}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="apl-form-group">
                                <label>Tính năng:</label>
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="apl-feature-input">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={e => updateFeature(index, e.target.value)}
                                            placeholder="Nhập tính năng"
                                        />
                                        {formData.features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeFeatureField(index)}
                                                className="apl-btn-remove-feature"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addFeatureField}
                                    className="apl-btn-add-feature"
                                >
                                    + Thêm tính năng
                                </button>
                            </div>
                            <div className="apl-form-group">
                                <label className="apl-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_published}
                                        onChange={e => setFormData(prev => ({...prev, is_published: e.target.checked}))}
                                    />
                                    Hiển thị công khai
                                </label>
                            </div>
                            <div className="apl-modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="apl-btn-secondary">
                                    Hủy
                                </button>
                                <button type="submit" className="apl-btn-primary">
                                    {currentPackage ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Xem Members */}
            {showMembersModal && (
                <div className="apl-modal-overlay" onClick={() => setShowMembersModal(false)}>
                    <div className="apl-modal-content apl-modal-large" onClick={e => e.stopPropagation()}>
                        <div className="apl-modal-header">
                            <div>
                                <h3>Thành viên gói {currentPackage?.name}</h3>
                                <p className="apl-members-count">
                                    Tổng số: <strong>{packageMembers.length}</strong> thành viên
                                </p>
                            </div>
                            <div className="apl-modal-header-actions">
                                <button 
                                    className="apl-btn-add-member"
                                    onClick={() => openAddMemberModal(currentPackage)}
                                    title="Thêm thành viên miễn phí"
                                >
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    <span>Thêm Member</span>
                                </button>
                                <button 
                                    className="apl-btn-excel"
                                    onClick={() => handleExportMembers(currentPackage?.id)}
                                >
                                    <FontAwesomeIcon icon={faFileExcel} />
                                    <span>Xuất Excel</span>
                                </button>
                                <button 
                                    className="apl-modal-close"
                                    onClick={() => setShowMembersModal(false)}
                                >×</button>
                            </div>
                        </div>
                        
                        {packageMembers.length === 0 ? (
                            <div className="apl-empty-state">
                                <FontAwesomeIcon icon={faUsers} className="apl-empty-icon" />
                                <p>Chưa có thành viên nào đăng ký gói này</p>
                            </div>
                        ) : (
                            <div className="apl-members-table-wrapper">
                                <table className="apl-members-table">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Tên thành viên</th>
                                            <th>Email</th>
                                            <th>SĐT</th>
                                            <th>Ngày bắt đầu</th>
                                            <th>Ngày kết thúc</th>
                                            <th>Trạng thái</th>
                                            <th>Số tiền</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {packageMembers.map((member, index) => (
                                            <tr key={member.id}>
                                                <td>{index + 1}</td>
                                                <td className="apl-member-name">
                                                    <div className="apl-member-avatar">
                                                        {member.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{member.full_name}</span>
                                                </td>
                                                <td>{member.email}</td>
                                                <td>{member.phone || '—'}</td>
                                                <td>{new Date(member.start_date).toLocaleDateString('vi-VN')}</td>
                                                <td>{new Date(member.end_date).toLocaleDateString('vi-VN')}</td>
                                                <td>
                                                    <span className={`apl-member-status apl-status-${member.status}`}>
                                                        {member.status === 'active' ? 'Đang hoạt động' : 
                                                         member.status === 'expired' ? 'Hết hạn' : 'Đã hủy'}
                                                    </span>
                                                </td>
                                                <td className="apl-member-amount">
                                                    {member.paid_amount.toLocaleString('vi-VN')}đ
                                                </td>
                                                <td>
                                                    <button
                                                        className="action-btn btn-delete"
                                                        onClick={() => {
                                                            console.log('Member data:', member); // Debug log
                                                            handleRemoveMember(member.member_package_id || member.id);
                                                        }}
                                                        title="Xóa khỏi gói"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Thêm Member Miễn Phí */}
            {showAddMemberModal && (
                <div className="apl-modal-overlay" onClick={() => setShowAddMemberModal(false)}>
                    <div className="apl-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="apl-modal-header">
                            <h3>Thêm thành viên vào gói {currentPackage?.name} (Miễn phí)</h3>
                            <button 
                                className="apl-modal-close"
                                onClick={() => setShowAddMemberModal(false)}
                            >×</button>
                        </div>
                        <div className="apl-add-member-form">
                            <div className="apl-form-group">
                                <label>Chọn thành viên:</label>
                                <select
                                    value={selectedUserId}
                                    onChange={e => setSelectedUserId(e.target.value)}
                                    className="apl-user-select"
                                    required
                                >
                                    <option value="">-- Chọn thành viên --</option>
                                    {allUsers.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="apl-form-group">
                                <label>Ghi chú (tùy chọn):</label>
                                <textarea
                                    value={freeNotes}
                                    onChange={e => setFreeNotes(e.target.value)}
                                    rows="3"
                                    placeholder="Ghi chú về việc tặng gói miễn phí..."
                                />
                            </div>
                            <div className="apl-modal-footer">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddMemberModal(false)} 
                                    className="apl-btn-secondary"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleAddMemberFree} 
                                    className="apl-btn-primary"
                                >
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    <span>Thêm miễn phí</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlans;
