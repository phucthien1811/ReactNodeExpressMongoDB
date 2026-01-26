import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faPlus, 
  faSearch, 
  faUsers, 
  faTrash,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

const EnrollmentModal = ({ isOpen, onClose, classData, onSuccess }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    if (isOpen && classData) {
      loadData();
    }
  }, [isOpen, classData]);

  const loadData = async () => {
    await Promise.all([
      loadEnrollments(),
      loadUsers()
    ]);
  };

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/schedules/${classData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load enrollments');
      
      const data = await response.json();
      setEnrollments(data.data.enrollments || []);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/users?role=member', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load users');
      
      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const enrollUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/schedules/${classData.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enroll user');
      }

      await loadEnrollments();
      setShowUserList(false);
      alert('Đăng ký học viên thành công!');
    } catch (err) {
      alert(err.message || 'Không thể đăng ký học viên');
    }
  };

  const removeEnrollment = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký của học viên này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/schedules/${classData.id}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove enrollment');
      }

      await loadEnrollments();
      alert('Hủy đăng ký thành công!');
    } catch (err) {
      alert(err.message || 'Không thể hủy đăng ký');
    }
  };

  const updateEnrollmentStatus = async (enrollmentId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/schedules/enrollments/${enrollmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      await loadEnrollments();
    } catch (err) {
      alert(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const filteredUsers = users.filter(user => {
    const isNotEnrolled = !enrollments.some(enrollment => enrollment.user_id === user.id);
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return isNotEnrolled && matchesSearch;
  });

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'enrolled': return 'badge-enrolled';
      case 'attended': return 'badge-attended';
      case 'missed': return 'badge-missed';
      case 'cancelled': return 'badge-cancelled';
      default: return 'badge-enrolled';
    }
  };

  if (!isOpen || !classData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content enrollment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Quản lý học viên - {classData.class_name}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="enrollment-content">
          {/* Class Info */}
          <div className="class-summary">
            <h4>{classData.class_name}</h4>
            <p>Số học viên: {classData.current_participants || 0}/{classData.max_participants || 0}</p>
            <div className="participants-bar">
              <div 
                className="participants-fill"
                style={{
                  width: `${((classData.current_participants || 0) / (classData.max_participants || 1)) * 100}%`
                }}
              ></div>
            </div>
          </div>

          {/* Add User Section */}
          <div className="add-user-section">
            <button 
              className="btn-primary"
              onClick={() => setShowUserList(!showUserList)}
              disabled={classData.current_participants >= classData.max_participants}
            >
              <FontAwesomeIcon icon={faPlus} />
              Thêm học viên
            </button>

            {showUserList && (
              <div className="user-list-section">
                <div className="search-box">
                  <FontAwesomeIcon icon={faSearch} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm học viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="user-list">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div key={user.id} className="user-item">
                        <div className="user-info">
                          <strong>{user.full_name}</strong>
                          <span>{user.email}</span>
                          {user.phone && <span>{user.phone}</span>}
                        </div>
                        <button
                          className="btn-success btn-sm"
                          onClick={() => enrollUser(user.id)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                          Thêm
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-users">
                      Không tìm thấy học viên phù hợp
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enrolled Users */}
          <div className="enrolled-users-section">
            <h4>
              <FontAwesomeIcon icon={faUsers} />
              Danh sách học viên đã đăng ký ({enrollments.length})
            </h4>

            {loading ? (
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin />
                Đang tải...
              </div>
            ) : enrollments.length > 0 ? (
              <div className="enrolled-list">
                {enrollments.map(enrollment => (
                  <div key={enrollment.id} className="enrollment-item">
                    <div className="enrollment-info">
                      <div className="student-info">
                        <strong>{enrollment.full_name}</strong>
                        <span className="student-email">{enrollment.email}</span>
                        {enrollment.phone && <span className="student-phone">{enrollment.phone}</span>}
                      </div>
                      <div className="enrollment-meta">
                        <span className="enrollment-date">
                          Đăng ký: {formatDateTime(enrollment.enrolled_at)}
                        </span>
                        {enrollment.attended_at && (
                          <span className="attendance-date">
                            Tham gia: {formatDateTime(enrollment.attended_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="enrollment-actions">
                      <div className="status-section">
                        <span className={`badge ${getStatusBadgeClass(enrollment.status)}`}>
                          {enrollment.status === 'enrolled' && 'Đã đăng ký'}
                          {enrollment.status === 'attended' && 'Đã tham gia'}
                          {enrollment.status === 'missed' && 'Vắng mặt'}
                          {enrollment.status === 'cancelled' && 'Đã hủy'}
                        </span>
                      </div>

                      <div className="action-buttons">
                        {enrollment.status === 'enrolled' && (
                          <>
                            <button
                              className="btn-success btn-sm"
                              onClick={() => updateEnrollmentStatus(enrollment.id, 'attended')}
                              title="Đánh dấu đã tham gia"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                            <button
                              className="btn-warning btn-sm"
                              onClick={() => updateEnrollmentStatus(enrollment.id, 'missed')}
                              title="Đánh dấu vắng mặt"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </>
                        )}
                        
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => removeEnrollment(enrollment.user_id)}
                          title="Hủy đăng ký"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-enrollments">
                <FontAwesomeIcon icon={faUsers} />
                <p>Chưa có học viên nào đăng ký</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;