import React, { useState, useEffect, useCallback } from 'react';
import trainerService from '../../services/trainerService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faToggleOn, 
  faToggleOff,
  faSearch,
  faEye,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './css/Trainers.css';
import { useToast } from '../../context/ToastContext';

const Trainers = () => {
  const { showSuccess, showError } = useToast();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
    experience_years: 0,
    certifications: '',
    hourly_rate: 0,
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  const fetchTrainers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const response = await trainerService.getAllTrainers(params);
      if (response.success) {
        setTrainers(response.data);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await trainerService.getTrainerStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
    fetchStats();
  }, [fetchTrainers, fetchStats]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên là bắt buộc';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Chuyên môn là bắt buộc';
    }
    
    if (formData.hourly_rate < 0) {
      newErrors.hourly_rate = 'Giá theo giờ không được âm';
    }
    
    if (formData.experience_years < 0) {
      newErrors.experience_years = 'Số năm kinh nghiệm không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      if (modalMode === 'create') {
        const response = await trainerService.createTrainer(formData);
        if (response.success) {
          showSuccess('Tạo huấn luyện viên thành công!');
          setShowModal(false);
          fetchTrainers();
          fetchStats();
        }
      } else if (modalMode === 'edit') {
        const response = await trainerService.updateTrainer(selectedTrainer.id, formData);
        if (response.success) {
          showSuccess('Cập nhật huấn luyện viên thành công!');
          setShowModal(false);
          fetchTrainers();
        }
      }
    } catch (error) {
      showError('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedTrainer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      bio: '',
      experience_years: 0,
      certifications: '',
      hourly_rate: 0,
      status: 'active'
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (trainer) => {
    setModalMode('edit');
    setSelectedTrainer(trainer);
    setFormData({
      name: trainer.name || '',
      email: trainer.email || '',
      phone: trainer.phone || '',
      specialization: trainer.specializations || '',
      bio: trainer.bio || '',
      experience_years: trainer.experience_years || 0,
      certifications: trainer.certification || '',
      hourly_rate: trainer.hourly_rate || 0,
      status: trainer.status || 'active'
    });
    setErrors({});
    setShowModal(true);
  };

  const handleView = (trainer) => {
    setModalMode('view');
    setSelectedTrainer(trainer);
    setShowModal(true);
  };

  const handleDelete = async (trainer) => {
    const trainerName = trainer.name || 'huấn luyện viên này';
    if (window.confirm(`Bạn có chắc muốn xóa huấn luyện viên "${trainerName}"?`)) {
      try {
        const response = await trainerService.deleteTrainer(trainer.id);
        if (response.success) {
          showSuccess('Xóa huấn luyện viên thành công!');
          fetchTrainers();
          fetchStats();
        }
      } catch (error) {
        showError('Lỗi: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (trainer) => {
    const newStatus = trainer.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await trainerService.updateTrainerStatus(trainer.id, newStatus);
      if (response.success) {
        showSuccess(newStatus === 'active' ? 'Đã kích hoạt huấn luyện viên' : 'Đã tạm dừng huấn luyện viên');
        fetchTrainers();
        fetchStats();
      }
    } catch (error) {
      showError('Lỗi: ' + error.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTrainer(null);
    setErrors({});
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="trainers-admin-container">
      {/* Header with inline stats */}
      <div className="trainers-page-header">
        <h1>Quản Lý Huấn Luyện Viên (PT)</h1>
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
            <span style={{ color: '#6b7280' }}>Tạm nghỉ: </span>
            <strong style={{ color: '#ef4444' }}>{stats.inactive || 0}</strong>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="trainers-filters">
        <div className="trainers-filters-left">
          <div className="trainers-search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, chuyên môn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="trainers-filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm nghỉ</option>
          </select>
        </div>
        <div className="trainers-filters-right">
          <button className="trainers-btn-primary" onClick={handleCreate}>
            <FontAwesomeIcon icon={faPlus} /> Thêm HLV
          </button>
        </div>
      </div>

      {/* Trainers Table */}
      <div className="trainers-table-container">
        {loading ? (
          <div className="trainers-loading">Đang tải...</div>
        ) : (
          <table className="trainers-table">
            <thead>
              <tr>
                <th>Huấn Luyện Viên</th>
                <th>Chuyên Môn</th>
                <th>Số Điện Thoại</th>
                <th>Kinh Nghiệm</th>
                <th>Giá/Giờ</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {trainers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="trainers-no-data">
                    Không có huấn luyện viên nào
                  </td>
                </tr>
              ) : (
                trainers.map(trainer => (
                  <tr key={trainer.id}>
                    <td>
                      <div className="trainers-info">
                        <div className="trainers-avatar">
                          {trainer.avatar_url ? (
                            <img src={trainer.avatar_url} alt={trainer.name || 'Trainer'} />
                          ) : (
                            <div className="trainers-avatar-placeholder">
                              {trainer.name ? trainer.name.charAt(0).toUpperCase() : 'T'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="trainers-name">{trainer.name || 'Chưa có tên'}</div>
                          <div className="trainers-email">{trainer.email || 'Chưa có email'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="trainers-specialization">{trainer.specializations}</span>
                    </td>
                    <td>{trainer.phone || 'Chưa cập nhật'}</td>
                    <td>{trainer.experience_years} năm</td>
                    <td>{formatCurrency(trainer.hourly_rate)}</td>
                    <td>
                      <span className={`trainers-status-badge ${trainer.status}`}>
                        {trainer.status === 'active' ? 'Hoạt động' : 'Tạm nghỉ'}
                      </span>
                    </td>
                    <td>
                      <div className="trainers-action-buttons">
                        <button 
                          className="trainers-btn-action view" 
                          onClick={() => handleView(trainer)}
                          title="Xem chi tiết"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          className="trainers-btn-action edit" 
                          onClick={() => handleEdit(trainer)}
                          title="Chỉnh sửa"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="trainers-btn-action toggle" 
                          onClick={() => handleToggleStatus(trainer)}
                          title={trainer.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                        >
                          <FontAwesomeIcon 
                            icon={trainer.status === 'active' ? faToggleOn : faToggleOff} 
                          />
                        </button>
                        <button 
                          className="trainers-btn-action delete" 
                          onClick={() => handleDelete(trainer)}
                          title="Xóa"
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
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="trainers-modal-overlay">
          <div className="trainers-modal-content">
            <div className="trainers-modal-header">
              <h3>
                {modalMode === 'create' && 'Thêm Huấn Luyện Viên Mới'}
                {modalMode === 'edit' && 'Chỉnh Sửa Huấn Luyện Viên'}
                {modalMode === 'view' && 'Thông Tin Huấn Luyện Viên'}
              </h3>
              <button className="trainers-close-button" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="trainers-modal-body">
              {modalMode === 'view' ? (
                // View Mode
                <div className="trainers-details">
                  <div className="trainers-detail-row">
                    <label>Tên:</label>
                    <span>{selectedTrainer?.name}</span>
                  </div>
                  <div className="trainers-detail-row">
                    <label>Email:</label>
                    <span>{selectedTrainer?.email}</span>
                  </div>
                  <div className="trainers-detail-row">
                    <label>Số điện thoại:</label>
                    <span>{selectedTrainer?.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="trainers-detail-row">
                    <label>Chuyên môn:</label>
                    <span>{selectedTrainer?.specializations}</span>
                  </div>
                  <div className="trainers-detail-row">
                    <label>Kinh nghiệm:</label>
                    <span>{selectedTrainer?.experience_years} năm</span>
                  </div>
                  <div className="trainers-detail-row">
                    <label>Chứng chỉ:</label>
                    <span>{selectedTrainer?.certification || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="trainers-detail-row">
                    <label>Giá theo giờ:</label>
                    <span>{formatCurrency(selectedTrainer?.hourly_rate)}</span>
                  </div>
                  <div className="trainers-detail-row">
                    <label>Tiểu sử:</label>
                    <span>{selectedTrainer?.bio || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="trainers-detail-row">
                    <label>Trạng thái:</label>
                    <span className={`trainers-status-badge ${selectedTrainer?.status}`}>
                      {selectedTrainer?.status === 'active' ? 'Hoạt động' : 'Tạm nghỉ'}
                    </span>
                  </div>
                </div>
              ) : (
                // Create/Edit Mode
                <form onSubmit={handleSubmit} className="trainers-form">
                  <div className="trainers-form-row">
                    <div className="trainers-form-group">
                      <label>Tên *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={errors.name ? 'trainers-error' : ''}
                      />
                      {errors.name && <span className="trainers-error-text">{errors.name}</span>}
                    </div>
                    <div className="trainers-form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'trainers-error' : ''}
                      />
                      {errors.email && <span className="trainers-error-text">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="trainers-form-row">
                    <div className="trainers-form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="trainers-form-group">
                      <label>Trạng thái</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Tạm nghỉ</option>
                      </select>
                    </div>
                  </div>

                  <div className="trainers-form-group">
                    <label>Chuyên môn *</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder="VD: Bodybuilding, Yoga, Boxing..."
                      className={errors.specialization ? 'trainers-error' : ''}
                    />
                    {errors.specialization && <span className="trainers-error-text">{errors.specialization}</span>}
                  </div>

                  <div className="trainers-form-row">
                    <div className="trainers-form-group">
                      <label>Số năm kinh nghiệm</label>
                      <input
                        type="number"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleInputChange}
                        min="0"
                        className={errors.experience_years ? 'trainers-error' : ''}
                      />
                      {errors.experience_years && <span className="trainers-error-text">{errors.experience_years}</span>}
                    </div>
                    <div className="trainers-form-group">
                      <label>Giá theo giờ (VNĐ)</label>
                      <input
                        type="number"
                        name="hourly_rate"
                        value={formData.hourly_rate}
                        onChange={handleInputChange}
                        min="0"
                        className={errors.hourly_rate ? 'trainers-error' : ''}
                      />
                      {errors.hourly_rate && <span className="trainers-error-text">{errors.hourly_rate}</span>}
                    </div>
                  </div>

                  <div className="trainers-form-group">
                    <label>Chứng chỉ</label>
                    <input
                      type="text"
                      name="certifications"
                      value={formData.certifications}
                      onChange={handleInputChange}
                      placeholder="VD: NASM-CPT, ACSM Certified..."
                    />
                  </div>

                  <div className="trainers-form-group">
                    <label>Tiểu sử</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Mô tả về huấn luyện viên..."
                    />
                  </div>

                  <div className="trainers-form-buttons">
                    <button type="button" className="trainers-btn-secondary" onClick={closeModal}>
                      Hủy
                    </button>
                    <button type="submit" className="trainers-btn-primary" disabled={loading}>
                      {loading ? 'Đang xử lý...' : (modalMode === 'create' ? 'Tạo mới' : 'Cập nhật')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainers;