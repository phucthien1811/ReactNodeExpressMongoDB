import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../context/ToastContext';
import './css/MemberSchedule.css'

const MemberSchedule = () => {
    const { showSuccess, showError } = useToast();
    const [scheduledClasses, setScheduledClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentWeekStart, setCurrentWeekStart] = useState(null);

    // Tính tuần hiện tại
    const getCurrentWeekStart = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Thứ 2 đầu tuần
        return new Date(today.setDate(diff));
    };

    // Format ngày thành string
    const formatDateString = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Tạo array 7 ngày trong tuần
    const getWeekDates = (weekStart) => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    // Load danh sách lớp học đã đăng ký
    const loadMySchedule = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            console.log('🔄 Loading my enrollments...');
            
            const response = await fetch(`/api/v1/schedules/my-enrollments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 API Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ My enrollments data:', data); // Debug log
                
                // Nếu không có data hoặc data rỗng, hiển thị empty
                if (!data || data.length === 0) {
                    setScheduledClasses([]);
                    return;
                }
                
                // Kiểm tra tuần hiện tại
                const currentWeek = currentWeekStart || getCurrentWeekStart();
                const weekDates = getWeekDates(currentWeek);
                
                console.log('📅 Current week dates:', weekDates.map(d => formatDateString(d)));
                
                // Transform data và lọc chỉ lấy lớp học trong tuần hiện tại
                const transformedData = data
                    .map(enrollment => {
                        // Extract date only từ datetime (2025-11-03T17:00:00.000Z -> 2025-11-03)
                        const classDateRaw = enrollment.class_date || new Date().toISOString();
                        const classDate = classDateRaw.split('T')[0]; // Lấy phần YYYY-MM-DD
                        const startTime = enrollment.start_time || '09:00:00';
                        const endTime = enrollment.end_time || '10:00:00';
                        
                        console.log(`🔍 Checking class: ${enrollment.class_name}, date: ${classDate} (raw: ${classDateRaw})`);
                        
                        // Kiểm tra xem lớp học có trong tuần hiện tại không
                        const isInCurrentWeek = weekDates.some(date => {
                            const weekDateStr = formatDateString(date);
                            console.log(`    Comparing with week date: ${weekDateStr}`);
                            return weekDateStr === classDate;
                        });
                        
                        console.log(`  → Is in current week? ${isInCurrentWeek}`);
                        
                        // Nếu không trong tuần này thì bỏ qua
                        if (!isInCurrentWeek) {
                            console.log(`  ❌ Skipping (not in current week)`);
                            return null;
                        }
                        
                        // Tìm ngày trong tuần (1-7) dựa trên ngày thực tế
                        const dayIndex = weekDates.findIndex(date => 
                            formatDateString(date) === classDate
                        );
                        
                        const dayOfWeek = dayIndex + 1; // 1=Thứ 2, 7=Chủ nhật
                        
                        // Sử dụng trường floor từ database, fallback về 1 nếu không có
                        const floor = enrollment.floor || 1;
                        
                        console.log(`  ✅ Adding to display: day=${dayOfWeek}, floor=${floor}`);
                        
                        return {
                            id: enrollment.schedule_id,
                            day: dayOfWeek,
                            floor: floor, // Sử dụng trường floor từ database
                            startTime: startTime.substring(0, 5), // "09:00"
                            endTime: endTime.substring(0, 5), // "10:00"
                            name: enrollment.class_name,
                            trainer: enrollment.trainer_name || 'Chưa có HLV',
                            studio: enrollment.room || enrollment.location || 'Phòng tập chính',
                            color: getClassColor(enrollment.class_name),
                            enrollment_id: enrollment.enrollment_id,
                            date: classDate,
                            isInCurrentWeek
                        };
                    })
                    .filter(item => item !== null); // Lọc bỏ các lớp không trong tuần này
                
                console.log('🔄 Transformed data (filtered for current week):', transformedData);
                console.log('📅 Classes with floor info:', transformedData);
                
                setScheduledClasses(transformedData);
            } else {
                console.error('❌ Failed to load enrollments:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('❌ Error details:', errorText);
            }
        } catch (error) {
            console.error('💥 Error loading my schedule:', error);
        } finally {
            setLoading(false);
        }
    }, [currentWeekStart]); // Dependency: reload khi đổi tuần

    // Hàm để chọn màu cho lớp học dựa trên tên
    const getClassColor = (className) => {
        if (className.toLowerCase().includes('yoga')) return 'green';
        if (className.toLowerCase().includes('cardio') || className.toLowerCase().includes('hiit')) return 'orange';
        if (className.toLowerCase().includes('boxing')) return 'red';
        if (className.toLowerCase().includes('strength') || className.toLowerCase().includes('gym')) return 'blue';
        return 'purple';
    };

    useEffect(() => {
        // Khởi tạo tuần hiện tại
        const weekStart = getCurrentWeekStart();
        setCurrentWeekStart(weekStart);
    }, []);

    // Reload khi đổi tuần
    useEffect(() => {
        if (currentWeekStart) {
            loadMySchedule();
        }
    }, [currentWeekStart, loadMySchedule]);

    // Tạo array ngày trong tuần hiện tại
    const weekStart = currentWeekStart || getCurrentWeekStart();
    const weekDates = getWeekDates(weekStart);
    
    // Tạo header với ngày thực
    const daysOfWeek = weekDates.map((date, index) => {
        const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
        return {
            name: dayNames[index],
            date: date.getDate(),
            month: date.getMonth() + 1
        };
    });
    
    // Thay đổi từ timeSlots thành floors
    const floors = ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4'];

    // Hàm để chuyển tuần
    const navigateWeek = (direction) => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() + (direction * 7));
        setCurrentWeekStart(newWeekStart);
    };

    // Hàm để tính toán vị trí trên lưới theo tầng
    const calculateGridPosition = (item) => {
        return {
            gridColumn: item.day + 1, // Cột theo ngày trong tuần (2-8, vì cột 1 là header tầng)
            gridRow: item.floor // Hàng theo tầng (1, 2, 3, 4)
        };
    };

    return (
        <div className="ms-container fade-in">
            <div className="ms-header">
                <h1 className="ms-title">Lịch tập của tôi</h1>
                <div className="ms-week-navigation">
                    <button className="ms-nav-btn" onClick={() => navigateWeek(-1)}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <div className="ms-week-display">
                        {formatDateString(weekDates[0]).split('-').reverse().join('/')} - {formatDateString(weekDates[6]).split('-').reverse().join('/')}
                    </div>
                    <button 
                        className="ms-nav-btn ms-current-week-btn" 
                        onClick={() => setCurrentWeekStart(getCurrentWeekStart())}
                        title="Quay về tuần hiện tại"
                    >
                        Hiện tại
                    </button>
                    <button className="ms-nav-btn" onClick={() => navigateWeek(1)}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>

            <div className="ms-grid-container">
                {/* Dòng tiêu đề các ngày trong tuần */}
                <div className="ms-grid-header"></div> {/* Ô trống góc trên bên trái */}
                {daysOfWeek.map((day, index) => (
                    <div key={index} className="ms-day-header">
                        {day.name}
                        <span className="ms-date-label">{day.date}/{day.month.toString().padStart(2, '0')}</span>
                    </div>
                ))}

                {/* Cột tầng bên trái */}
                <div className="ms-time-column">
                    {floors.map(floor => <div key={floor} className="ms-time-slot-label">{floor}</div>)}
                </div>

                {/* Lưới lịch tập chính */}
                <div className="ms-main-grid">
                    {/* Hiển thị các lớp học đã đặt */}
                    {loading ? (
                        <div className="ms-loading">Đang tải lịch của bạn...</div>
                    ) : scheduledClasses.length === 0 ? (
                        <div className="ms-empty">Bạn chưa đăng ký lớp học nào</div>
                    ) : (
                        scheduledClasses.map(item => {
                            const gridPosition = calculateGridPosition(item);
                            console.log(`Item ${item.name}: day=${item.day}, floor=${item.floor}, gridColumn=${gridPosition.gridColumn}, gridRow=${gridPosition.gridRow}`);
                            return (
                                <div 
                                    key={item.id} 
                                    className={`ms-scheduled-item ms-event-${item.color}`} 
                                    style={{
                                        gridColumn: gridPosition.gridColumn,
                                        gridRow: gridPosition.gridRow
                                    }}
                                >
                                    <p className="ms-event-name">{item.name}</p>
                                    <p className="ms-event-details">{item.startTime} - {item.endTime}</p>
                                    <p className="ms-event-details">HLV: {item.trainer}</p>
                                    <p className="ms-event-details">Phòng: {item.studio}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberSchedule;
