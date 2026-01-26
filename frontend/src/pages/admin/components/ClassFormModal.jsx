import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

const ClassFormModal = ({ isOpen, onClose, classData, trainers, onSuccess }) => {
  const [formData, setFormData] = useState({
    class_name: '',
    description: '',
    trainer_id: '',
    max_participants: 20,
    price: 0,
    room: '',
    start_time: '',
    end_time: '',
    class_date: '',
    day_of_week: '',
    is_recurring: false,
    status: 'scheduled',
    difficulty_level: 'beginner',
    location: '',
    equipment_needed: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (classData) {
      setFormData({
        class_name: classData.class_name || '',
        description: classData.description || '',
        trainer_id: classData.trainer_id || '',
        max_participants: classData.max_participants || 20,
        price: classData.price || 0,
        room: classData.room || '',
        start_time: classData.start_time ? classData.start_time.substring(0, 5) : '',
        end_time: classData.end_time ? classData.end_time.substring(0, 5) : '',
        class_date: classData.class_date ? classData.class_date.split('T')[0] : '',
        day_of_week: classData.day_of_week || '',
        is_recurring: classData.is_recurring || false,
        status: classData.status || 'scheduled',
        difficulty_level: classData.difficulty_level || 'beginner',
        location: classData.location || '',
        equipment_needed: classData.equipment_needed || []
      });
    } else {
      // Reset form for new class
      setFormData({
        class_name: '',
        description: '',
        trainer_id: '',
        max_participants: 20,
        price: 0,
        room: '',
        start_time: '',
        end_time: '',
        class_date: '',
        day_of_week: '',
        is_recurring: false,
        status: 'scheduled',
        difficulty_level: 'beginner',
        location: '',
        equipment_needed: []
      });
    }
  }, [classData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEquipmentChange = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment_needed: prev.equipment_needed.includes(equipment)
        ? prev.equipment_needed.filter(item => item !== equipment)
        : [...prev.equipment_needed, equipment]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = classData 
        ? `/api/v1/schedules/${classData.id}`
        : '/api/v1/schedules';
      
      const method = classData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          max_participants: parseInt(formData.max_participants),
          price: parseFloat(formData.price)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save class');
      }

      onSuccess();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu lớp học');
    } finally {
      setLoading(false);
    }
  };

  const equipmentOptions = [
    'Tạ', 'Thảm yoga', 'Băng kháng lực', 'Bóng tập', 'Thanh xà', 'Máy chạy bộ', 
    'Xe đạp tập', 'Găng tay boxing', 'Bao cát', 'Dây nhảy'
  ];

  if (!isOpen) return null;

  return (
    <div className="ad-class-modal-overlay" onClick={onClose}>
      <div className="ad-class-modal-content ad-class-class-form-modal" onClick={e => e.stopPropagation()}>
        <div className="ad-class-modal-header">
          <h3>{classData ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}</h3>
          <button className="ad-class-modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ad-class-class-form">
          {error && <div className="ad-class-error-message">{error}</div>}

          <div className="ad-class-form-grid">
            <div className="ad-class-form-group">
              <label>Tên lớp học *</label>
              <input
                type="text"
                name="class_name"
                value={formData.class_name}
                onChange={handleInputChange}
                required
                placeholder="Ví dụ: Yoga Flow, Boxing..."
              />
            </div>

            <div className="ad-class-form-group">
              <label>Huấn luyện viên</label>
              <select
                name="trainer_id"
                value={formData.trainer_id}
                onChange={handleInputChange}
              >
                <option value="">Chọn HLV</option>
                {trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.trainer_name || trainer.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ad-class-form-group">
              <label>Ngày học *</label>
              <input
                type="date"
                name="class_date"
                value={formData.class_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="ad-class-form-group">
              <label>Thứ trong tuần</label>
              <select
                name="day_of_week"
                value={formData.day_of_week}
                onChange={handleInputChange}
              >
                <option value="">Chọn thứ</option>
                <option value="monday">Thứ 2</option>
                <option value="tuesday">Thứ 3</option>
                <option value="wednesday">Thứ 4</option>
                <option value="thursday">Thứ 5</option>
                <option value="friday">Thứ 6</option>
                <option value="saturday">Thứ 7</option>
                <option value="sunday">Chủ nhật</option>
              </select>
            </div>

            <div className="ad-class-form-group">
              <label>Giờ bắt đầu *</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="ad-class-form-group">
              <label>Giờ kết thúc *</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="ad-class-form-group">
              <label>Số học viên tối đa</label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleInputChange}
                min="1"
                max="100"
              />
            </div>

            <div className="ad-class-form-group">
              <label>Giá (VNĐ)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="1000"
              />
            </div>

            <div className="ad-class-form-group">
              <label>Phòng tập</label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                placeholder="Ví dụ: Phòng A1, Studio..."
              />
            </div>

            <div className="ad-class-form-group">
              <label>Địa điểm</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ví dụ: Tầng 2, Khu vực cardio..."
              />
            </div>

            <div className="ad-class-form-group">
              <label>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="scheduled">Đã lên lịch</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div className="ad-class-form-group">
              <label>Độ khó</label>
              <select
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleInputChange}
              >
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
          </div>

          <div className="ad-class-form-group ad-class-full-width">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Mô tả về lớp học..."
            />
          </div>

          <div className="ad-class-form-group ad-class-full-width">
            <label>Thiết bị cần thiết</label>
            <div className="ad-class-equipment-grid">
              {equipmentOptions.map(equipment => (
                <label key={equipment} className="ad-class-equipment-item">
                  <input
                    type="checkbox"
                    checked={formData.equipment_needed.includes(equipment)}
                    onChange={() => handleEquipmentChange(equipment)}
                  />
                  <span>{equipment}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ad-class-form-group ad-class-full-width">
            <label className="ad-class-checkbox-label">
              <input
                type="checkbox"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleInputChange}
              />
              <span>Lớp học định kỳ</span>
            </label>
          </div>

          <div className="ad-class-form-actions">
            <button type="button" className="ad-class-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="ad-class-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Đang lưu...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  {classData ? 'Cập nhật' : 'Tạo mới'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassFormModal;