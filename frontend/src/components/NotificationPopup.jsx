import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faDumbbell, 
  faClock, 
  faUser,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import './NotificationPopup.css';

const NotificationPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔔 NotificationPopup mounted');
    // Chỉ hiển thị popup cho member role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👤 User role:', user.role);
    if (user.role === 'member') {
      checkTodayClasses();
    }
  }, []);

  const checkTodayClasses = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking today classes...');
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/v1/schedules/my-enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response status:', response.status);

      if (response.ok) {
        const enrollments = await response.json();
        console.log('📋 All enrollments:', enrollments);
        
        // Lọc lịch học hôm nay
        const today = new Date().toISOString().split('T')[0];
        console.log('📅 Today date:', today);
        
        const todaySchedules = enrollments.filter(enrollment => {
          console.log('🔍 Checking enrollment date:', enrollment.class_date, 'vs today:', today);
          return enrollment.class_date === today;
        });

        console.log('🎯 Today schedules found:', todaySchedules);

        if (todaySchedules.length > 0) {
          setTodayClasses(todaySchedules);
          setIsVisible(true);
          console.log('✅ Popup will be shown');
          
          // Tự động ẩn sau 10 giây
          setTimeout(() => {
            setIsVisible(false);
          }, 10000);
        } else {
          console.log('❌ No classes today');
        }
      } else {
        console.error('❌ API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('💥 Error checking today classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  if (!isVisible && !loading) {
    // Tạm thời hiển thị popup để test (bỏ comment dòng dưới)
    // return <div style={{position: 'fixed', top: '20px', right: '20px', background: 'red', color: 'white', padding: '10px', zIndex: 9999}}>Popup Component Loaded</div>;
    return null;
  }

  return (
    <div className="notification-popup-overlay">
      <div className="notification-popup">
        <div className="popup-header">
          <div className="popup-icon">
            <FontAwesomeIcon icon={faDumbbell} />
          </div>
          <h3>Lịch tập hôm nay</h3>
          <button 
            className="close-btn" 
            onClick={() => setIsVisible(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="popup-content">
          {todayClasses.length === 0 ? (
            <p className="no-classes">Bạn không có lịch tập nào hôm nay</p>
          ) : (
            <div className="classes-list">
              {todayClasses.map((classItem, index) => (
                <div key={index} className="class-item">
                  <div className="class-icon">
                    <FontAwesomeIcon icon={faDumbbell} />
                  </div>
                  <div className="class-info">
                    <h4>{classItem.class_name}</h4>
                    <div className="class-details">
                      <span className="time">
                        <FontAwesomeIcon icon={faClock} />
                        {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                      </span>
                      {classItem.trainer_name && (
                        <span className="trainer">
                          <FontAwesomeIcon icon={faUser} />
                          HLV {classItem.trainer_name}
                        </span>
                      )}
                      <span className="location">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        {classItem.room || classItem.location || 'Phòng tập chính'}
                      </span>
                    </div>
                  </div>
                  <div className="class-time">
                    {formatTime(classItem.start_time)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="popup-footer">
          <button 
            className="btn-primary" 
            onClick={() => {
              setIsVisible(false);
              window.location.href = '/member/schedule';
            }}
          >
            Xem lịch tập đầy đủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;