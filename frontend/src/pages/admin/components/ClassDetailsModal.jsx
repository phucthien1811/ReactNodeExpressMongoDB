import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faUsers, 
  faClock, 
  faCalendar, 
  faMapMarkerAlt,
  faDumbbell,
  faInfo,
  faGraduationCap,
  faCheck,
  faTimes as faTimesIcon
} from '@fortawesome/free-solid-svg-icons';

const ClassDetailsModal = ({ isOpen, onClose, classData }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && classData) {
      loadClassDetails();
    }
  }, [isOpen, classData]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/schedules/${classData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load class details');
      
      const data = await response.json();
      setEnrollments(data.data.enrollments || []);
    } catch (err) {
      console.error('Failed to load class details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled': return 'badge-scheduled';
      case 'ongoing': return 'badge-ongoing';
      case 'completed': return 'badge-completed';
      case 'cancelled': return 'badge-cancelled';
      default: return 'badge-scheduled';
    }
  };

  const getDifficultyBadgeClass = (level) => {
    switch (level) {
      case 'beginner': return 'badge-beginner';
      case 'intermediate': return 'badge-intermediate';
      case 'advanced': return 'badge-advanced';
      default: return 'badge-beginner';
    }
  };

  const getEnrollmentStatusIcon = (status) => {
    switch (status) {
      case 'enrolled': return <FontAwesomeIcon icon={faUsers} className="status-enrolled" />;
      case 'attended': return <FontAwesomeIcon icon={faCheck} className="status-attended" />;
      case 'missed': return <FontAwesomeIcon icon={faTimesIcon} className="status-missed" />;
      case 'cancelled': return <FontAwesomeIcon icon={faTimesIcon} className="status-cancelled" />;
      default: return <FontAwesomeIcon icon={faUsers} />;
    }
  };

  if (!isOpen || !classData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content class-details-modal" onClick={e => e.stopPropagation()}>
        <div className="ad-class-modal-header">
          <h3>Chi tiết lớp học</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="class-details-content">
          {/* Class Info */}
          <div className="class-info-section">
            <div className="class-title-section">
              <h2 className="class-title">{classData.class_name}</h2>
              <div className="class-badges">
                <span className={`badge ${getStatusBadgeClass(classData.status)}`}>
                  {classData.status === 'scheduled' && 'Đã lên lịch'}
                  {classData.status === 'ongoing' && 'Đang diễn ra'}
                  {classData.status === 'completed' && 'Hoàn thành'}
                  {classData.status === 'cancelled' && 'Đã hủy'}
                </span>
                <span className={`badge ${getDifficultyBadgeClass(classData.difficulty_level)}`}>
                  <FontAwesomeIcon icon={faGraduationCap} />
                  {classData.difficulty_level === 'beginner' && 'Cơ bản'}
                  {classData.difficulty_level === 'intermediate' && 'Trung cấp'}
                  {classData.difficulty_level === 'advanced' && 'Nâng cao'}
                </span>
              </div>
            </div>

            <div className="class-details-grid">
              <div className="detail-item">
                <FontAwesomeIcon icon={faCalendar} />
                <div>
                  <label>Ngày học</label>
                  <span>{formatDate(classData.class_date)}</span>
                </div>
              </div>

              <div className="detail-item">
                <FontAwesomeIcon icon={faClock} />
                <div>
                  <label>Thời gian</label>
                  <span>{formatTime(classData.start_time)} - {formatTime(classData.end_time)}</span>
                </div>
              </div>

              {classData.trainer_name && (
                <div className="detail-item">
                  <FontAwesomeIcon icon={faUsers} />
                  <div>
                    <label>Huấn luyện viên</label>
                    <span>{classData.trainer_name}</span>
                  </div>
                </div>
              )}

              <div className="detail-item">
                <FontAwesomeIcon icon={faUsers} />
                <div>
                  <label>Số học viên</label>
                  <span>{classData.current_participants || 0}/{classData.max_participants || 0}</span>
                </div>
              </div>

              {classData.price > 0 && (
                <div className="detail-item">
                  <FontAwesomeIcon icon={faDumbbell} />
                  <div>
                    <label>Giá</label>
                    <span>{classData.price.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>
              )}

              {classData.location && (
                <div className="detail-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <div>
                    <label>Địa điểm</label>
                    <span>{classData.location}</span>
                  </div>
                </div>
              )}

              {classData.room && (
                <div className="detail-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <div>
                    <label>Phòng</label>
                    <span>{classData.room}</span>
                  </div>
                </div>
              )}
            </div>

            {classData.description && (
              <div className="description-section">
                <h4>
                  <FontAwesomeIcon icon={faInfo} />
                  Mô tả
                </h4>
                <p>{classData.description}</p>
              </div>
            )}

            {classData.equipment_needed && classData.equipment_needed.length > 0 && (
              <div className="equipment-section">
                <h4>
                  <FontAwesomeIcon icon={faDumbbell} />
                  Thiết bị cần thiết
                </h4>
                <div className="equipment-list">
                  {classData.equipment_needed.map((equipment, index) => (
                    <span key={index} className="equipment-tag">{equipment}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enrollments */}
          <div className="enrollments-section">
            <h4>
              <FontAwesomeIcon icon={faUsers} />
              Danh sách học viên ({enrollments.length})
            </h4>
            
            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : enrollments.length > 0 ? (
              <div className="enrollments-list">
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
                    <div className="enrollment-status">
                      {getEnrollmentStatusIcon(enrollment.status)}
                      <span className={`status-text status-${enrollment.status}`}>
                        {enrollment.status === 'enrolled' && 'Đã đăng ký'}
                        {enrollment.status === 'attended' && 'Đã tham gia'}
                        {enrollment.status === 'missed' && 'Vắng mặt'}
                        {enrollment.status === 'cancelled' && 'Đã hủy'}
                      </span>
                    </div>
                    {enrollment.notes && (
                      <div className="enrollment-notes">
                        <small>{enrollment.notes}</small>
                      </div>
                    )}
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
      </div>
    </div>
  );
};

export default ClassDetailsModal;