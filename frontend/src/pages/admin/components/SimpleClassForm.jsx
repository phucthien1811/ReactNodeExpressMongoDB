import React, { useState } from 'react';
import '../css/SimpleClassForm.css';
import { useToast } from '../../../context/ToastContext';

const SimpleClassForm = ({ isOpen, onClose, onSuccess, editingClass, trainers = [] }) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    class_name: editingClass?.class_name || '',
    description: editingClass?.description || '',
    trainer_id: editingClass?.trainer_id || '',
    max_participants: editingClass?.max_participants || 20,
    start_time: editingClass?.start_time?.substring(0,5) || '',
    end_time: editingClass?.end_time?.substring(0,5) || '',
    class_date: editingClass?.class_date?.split('T')[0] || '',
    status: editingClass?.status || 'scheduled',
    difficulty_level: editingClass?.difficulty_level || 'beginner',
    floor: editingClass?.floor || 1, 
    room: editingClass?.room || '',
    location: editingClass?.location || '',
    // Thêm các trường cho lặp lại
    is_recurring: false,
    recurring_end_date: '',
    recurring_days: [] // Các ngày trong tuần: 0=CN, 1=T2, 2=T3...
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Nếu không lặp lại hoặc đang edit, tạo/update bình thường
      if (!formData.is_recurring || editingClass) {
        const url = editingClass 
          ? `/api/v1/schedules/${editingClass.id}`
          : '/api/v1/schedules';
        
        const method = editingClass ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            max_participants: parseInt(formData.max_participants) || 20,
            trainer_id: formData.trainer_id || null,
            floor: parseInt(formData.floor) || 1
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save class');
        }

        showSuccess(editingClass ? 'Cập nhật lớp học thành công!' : 'Tạo lớp học thành công!');
      } else {
        // Tạo lớp lặp lại
        if (formData.recurring_days.length === 0) {
          throw new Error('Vui lòng chọn ít nhất 1 ngày trong tuần');
        }

        if (!formData.recurring_end_date) {
          throw new Error('Vui lòng chọn ngày kết thúc lặp lại');
        }

        // Tạo danh sách các ngày cần tạo lớp
        const startDate = new Date(formData.class_date);
        const endDate = new Date(formData.recurring_end_date);
        const dates = [];

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (formData.recurring_days.includes(dayOfWeek)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
          }
        }

        if (dates.length === 0) {
          throw new Error('Không có ngày nào phù hợp với lịch đã chọn');
        }

        if (dates.length > 100) {
          throw new Error('Quá nhiều lớp học (>100). Vui lòng chọn khoảng thời gian ngắn hơn');
        }

        // Confirm với user
        if (!window.confirm(`Bạn có chắc muốn tạo ${dates.length} lớp học?`)) {
          setLoading(false);
          return;
        }

        // Tạo từng lớp
        let successCount = 0;
        for (const date of dates) {
          try {
            const response = await fetch('/api/v1/schedules', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                class_name: formData.class_name,
                description: formData.description,
                trainer_id: formData.trainer_id || null,
                max_participants: parseInt(formData.max_participants) || 20,
                start_time: formData.start_time,
                end_time: formData.end_time,
                class_date: date,
                status: 'scheduled',
                difficulty_level: formData.difficulty_level,
                floor: parseInt(formData.floor) || 1,
                room: formData.room,
                location: formData.location
              })
            });

            if (response.ok) successCount++;
          } catch (err) {
            console.error(`Failed to create class for ${date}:`, err);
          }
        }

        showSuccess(`Đã tạo thành công ${successCount}/${dates.length} lớp học!`);
      }

      onSuccess();
    } catch (err) {
      showError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="simple-modal-overlay" onClick={onClose}>
      <div className="simple-modal-content" onClick={e => e.stopPropagation()}>
        <div className="simple-modal-header">
          <h3>{editingClass ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}</h3>
          <button className="simple-modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="simple-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="simple-form-grid">
              <div className="simple-form-group">
                <label>Tên lớp học *</label>
                <input
                  type="text"
                  value={formData.class_name}
                  onChange={(e) => setFormData(prev => ({...prev, class_name: e.target.value}))}
                  required
                  placeholder="Ví dụ: Yoga Flow, Boxing..."
                />
              </div>

              <div className="simple-form-group">
                <label>Số học viên tối đa</label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData(prev => ({...prev, max_participants: e.target.value}))}
                  min="1"
                  max="100"
                />
              </div>

              <div className="simple-form-group">
                <label>Huấn luyện viên</label>
                <select
                  value={formData.trainer_id}
                  onChange={(e) => setFormData(prev => ({...prev, trainer_id: e.target.value}))}
                >
                  <option value="">Chọn HLV</option>
                  {trainers.map(trainer => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.full_name || trainer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="simple-form-group">
                <label>Ngày học *</label>
                <input
                  type="date"
                  value={formData.class_date}
                  onChange={(e) => setFormData(prev => ({...prev, class_date: e.target.value}))}
                  required
                />
              </div>

              <div className="simple-form-group">
                <label>Giờ bắt đầu *</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({...prev, start_time: e.target.value}))}
                  required
                />
              </div>

              <div className="simple-form-group">
                <label>Giờ kết thúc *</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({...prev, end_time: e.target.value}))}
                  required
                />
              </div>

              <div className="simple-form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                >
                  <option value="scheduled">Đã lên lịch</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="simple-form-group">
                <label>Độ khó</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData(prev => ({...prev, difficulty_level: e.target.value}))}
                >
                  <option value="beginner">Cơ bản</option>
                  <option value="intermediate">Trung cấp</option>
                  <option value="advanced">Nâng cao</option>
                </select>
              </div>

              <div className="simple-form-group">
                <label>Tầng *</label>
                <select
                  value={formData.floor}
                  onChange={(e) => setFormData(prev => ({...prev, floor: e.target.value}))}
                  required
                >
                  <option value={1}>Tầng 1</option>
                  <option value={2}>Tầng 2</option>
                  <option value={3}>Tầng 3</option>
                  <option value={4}>Tầng 4</option>
                </select>
              </div>

              <div className="simple-form-group">
                <label>Phòng tập *</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData(prev => ({...prev, room: e.target.value}))}
                  placeholder="VD: Phòng A1, Studio Yoga, Phòng Cardio..."
                  required
                />
              </div>

              <div className="simple-form-group">
                <label>Vị trí chi tiết</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                  placeholder="VD: Gần thang máy, cuối hành lang..."
                />
              </div>

              <div className="simple-form-group simple-form-description">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  rows="3"
                  placeholder="Mô tả về lớp học..."
                />
              </div>

              {/* Phần lặp lại lớp học */}
              {!editingClass && (
                <div className="simple-form-recurring-section">
                  <div className="simple-form-group simple-form-full-width">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.is_recurring}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          is_recurring: e.target.checked,
                          recurring_days: e.target.checked ? prev.recurring_days : []
                        }))}
                        style={{ cursor: 'pointer', width: 'auto' }}
                      />
                      <span style={{ fontWeight: '600', color: '#22c55e' }}>
                        🔁 Lặp lại lớp học theo lịch
                      </span>
                    </label>
                  </div>

                  {formData.is_recurring && (
                    <>
                      <div className="simple-form-group simple-form-full-width">
                        <label>Chọn các ngày trong tuần</label>
                        <div className="simple-weekday-selector">
                          {[
                            { value: 1, label: 'T2' },
                            { value: 2, label: 'T3' },
                            { value: 3, label: 'T4' },
                            { value: 4, label: 'T5' },
                            { value: 5, label: 'T6' },
                            { value: 6, label: 'T7' },
                            { value: 0, label: 'CN' }
                          ].map(day => (
                            <label key={day.value} className="simple-weekday-option">
                              <input
                                type="checkbox"
                                checked={formData.recurring_days.includes(day.value)}
                                onChange={(e) => {
                                  const days = e.target.checked
                                    ? [...formData.recurring_days, day.value]
                                    : formData.recurring_days.filter(d => d !== day.value);
                                  setFormData(prev => ({ ...prev, recurring_days: days }));
                                }}
                              />
                              <span>{day.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="simple-form-group">
                        <label>Lặp lại đến ngày</label>
                        <input
                          type="date"
                          value={formData.recurring_end_date}
                          onChange={(e) => setFormData(prev => ({...prev, recurring_end_date: e.target.value}))}
                          min={formData.class_date}
                          placeholder="Chọn ngày kết thúc"
                        />
                        <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                          Hệ thống sẽ tạo tự động các lớp học theo lịch đã chọn
                        </small>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="simple-form-actions">
              <button type="button" className="simple-btn simple-btn-secondary" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="simple-btn simple-btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner">⟳</span>
                    Đang lưu...
                  </>
                ) : (
                  editingClass ? 'Cập nhật' : 'Tạo mới'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimpleClassForm;