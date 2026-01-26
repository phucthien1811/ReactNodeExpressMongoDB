import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../context/ToastContext';
import './css/MemberBookClass.css';

const BookClass = () => {
    const { showSuccess, showError } = useToast();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Load danh sách lớp học từ API
    const loadAvailableClasses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch('/api/v1/schedules?status=scheduled', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                // Data nằm trong result.data
                const classesData = result.data || result || [];
                setClasses(Array.isArray(classesData) ? classesData : []);
            } else {
                throw new Error('Không thể tải danh sách lớp học');
            }
        } catch (err) {
            console.error('Error loading classes:', err);
            setError(err.message);
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    // Đăng ký lớp học
    const enrollInClass = async (classId) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/v1/schedules/${classId}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                showSuccess('Đăng ký lớp học thành công!');
                loadAvailableClasses(); // Reload để cập nhật số lượng
            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Có lỗi xảy ra khi đăng ký');
            }
        } catch (err) {
            console.error('Error enrolling:', err);
            showError('Có lỗi xảy ra khi đăng ký');
        }
    };

    // Hủy đăng ký lớp học
    const unenrollFromClass = async (classId) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/v1/schedules/${classId}/enroll`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                showSuccess('Hủy đăng ký thành công!');
                loadAvailableClasses();
            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Có lỗi xảy ra khi hủy đăng ký');
            }
        } catch (err) {
            console.error('Error unenrolling:', err);
            showError('Có lỗi xảy ra khi hủy đăng ký');
        }
    };


    const filteredClasses = classes.filter(classItem => {
        const matchesSearch = classItem.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            classItem.trainer_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        if (filter === 'available') return matchesSearch && classItem.current_participants < classItem.max_participants;
        if (filter === 'full') return matchesSearch && classItem.current_participants >= classItem.max_participants;
        
        return matchesSearch;
    });

    useEffect(() => {
        loadAvailableClasses();
    }, []);

    if (loading) {
        return (
            <div className="bc-container">
                <div className="bc-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Đang tải danh sách lớp học...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bc-container">
            {/* Header */}
            <div className="bc-header">
                <h1>Đăng ký lớp học</h1>
            </div>

            {/* Controls: Filter buttons and Search */}
            <div className="bc-controls">
                <div className="bc-filter-buttons">
                    <button 
                        className={`bc-filter-btn ${filter === 'all' ? 'bc-active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả
                    </button>
                    <button 
                        className={`bc-filter-btn ${filter === 'available' ? 'bc-active' : ''}`}
                        onClick={() => setFilter('available')}
                    >
                        Còn chỗ
                    </button>
                    <button 
                        className={`bc-filter-btn ${filter === 'full' ? 'bc-active' : ''}`}
                        onClick={() => setFilter('full')}
                    >
                        Đã đầy
                    </button>
                </div>
                
                <div className="bc-search">
                    <FontAwesomeIcon icon={faSearch} className="bc-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm lớp học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bc-search-input"
                    />
                </div>
            </div>

            {/* Table */}
            {error ? (
                <div className="bc-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{error}</p>
                    <button onClick={loadAvailableClasses} className="bc-retry-btn">
                        <i className="fas fa-redo"></i>
                        Thử lại
                    </button>
                </div>
            ) : filteredClasses.length === 0 ? (
                <div className="bc-empty">
                    <i className="fas fa-calendar-times"></i>
                    <h3>Không có lớp học nào</h3>
                    <p>
                        {searchTerm ? 'Không tìm thấy lớp học phù hợp với từ khóa tìm kiếm' : 
                         'Hiện tại chưa có lớp học nào được mở'}
                    </p>
                </div>
            ) : (
                <div className="bc-table-wrapper">
                    <table className="bc-table">
                        <thead>
                            <tr>
                                <th>Tên lớp</th>
                                <th>Huấn luyện viên</th>
                                <th>Ngày</th>
                                <th>Giờ bắt đầu</th>
                                <th>Giờ kết thúc</th>
                                <th>Số lượng</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasses.map(classItem => {
                                const isAvailable = classItem.current_participants < classItem.max_participants;
                                const isEnrolled = classItem.is_enrolled || false;
                                
                                // Format date (DD/MM/YYYY)
                                let formattedDate = 'N/A';
                                if (classItem.class_date) {
                                    const dateObj = new Date(classItem.class_date);
                                    formattedDate = dateObj.toLocaleDateString('vi-VN');
                                }
                                
                                // Format time (HH:MM)
                                const startTime = classItem.start_time ? classItem.start_time.substring(0, 5) : 'N/A';
                                const endTime = classItem.end_time ? classItem.end_time.substring(0, 5) : 'N/A';
                                
                                // Format participants count
                                const currentCount = classItem.current_participants || 0;
                                const maxCount = classItem.max_participants || 0;
                                
                                return (
                                    <tr key={classItem.id} className={isEnrolled ? 'bc-enrolled-row' : ''}>
                                        <td className="bc-class-name">{classItem.class_name}</td>
                                        <td>{classItem.trainer_name || 'Chưa có'}</td>
                                        <td>{formattedDate}</td>
                                        <td>{startTime}</td>
                                        <td>{endTime}</td>
                                        <td className="bc-participants">
                                            <span className={`bc-count ${!isAvailable ? 'bc-full' : ''}`}>
                                                {currentCount}/{maxCount}
                                            </span>
                                        </td>
                                        <td>
                                            {isEnrolled ? (
                                                <button 
                                                    className="bc-btn bc-unenroll-btn"
                                                    onClick={() => unenrollFromClass(classItem.id)}
                                                    title="Bạn đã đăng ký lớp này (hoặc admin đã thêm bạn vào)"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                    Hủy đăng ký
                                                </button>
                                            ) : (
                                                <button 
                                                    className={`bc-btn bc-enroll-btn ${!isAvailable ? 'bc-disabled' : ''}`}
                                                    onClick={() => enrollInClass(classItem.id)}
                                                    disabled={!isAvailable}
                                                >
                                                    <FontAwesomeIcon icon={faCheck} />
                                                    {isAvailable ? 'Đăng ký' : 'Đã đầy'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BookClass;
