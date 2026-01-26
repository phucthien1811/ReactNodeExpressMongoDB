import React, { useState, useEffect } from 'react';
import './css/MemberDashboard.css'; 
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import memberProfileService from '../../services/memberProfileService.js';
import scheduleService from '../../services/scheduleService.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faCalendarCheck, faDumbbell, faTimes, faQrcode } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);
    const [todaysClasses, setTodaysClasses] = useState([]);

    // Fetch user profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log('🔍 Dashboard: Fetching user profile...');
                const response = await memberProfileService.getProfile();
                console.log('📥 Dashboard: Profile response:', response);
                
                if (response.success && response.data) {
                    setUserProfile(response.data);
                    console.log('✅ Dashboard: Profile loaded:', response.data);
                }
            } catch (error) {
                console.error('❌ Dashboard: Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    // Fetch today's classes
    useEffect(() => {
        const fetchTodaySchedule = async () => {
            try {
                console.log('🔍 Dashboard: Fetching today schedule...');
                const response = await scheduleService.getTodaySchedule();
                console.log('📥 Dashboard: Today schedule response:', response);
                
                if (response.success && response.data) {
                    setTodaysClasses(response.data);
                    console.log('✅ Dashboard: Today classes loaded:', response.data);
                }
            } catch (error) {
                console.error('❌ Dashboard: Error fetching today schedule:', error);
            }
        };

        if (user) {
            fetchTodaySchedule();
        }
    }, [user]);

    // Helper function to get full avatar URL
    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return 'https://placehold.co/100x100/333333/FFFFFF?text=User';
        if (avatarPath.startsWith('blob:') || avatarPath.startsWith('http')) return avatarPath;
        const filename = avatarPath.replace('/uploads/avatars/', '');
        return `http://localhost:4000/api/v1/uploads/avatars/${filename}`;
    };

    // Lấy thông tin gói tập từ profile
    const getMembershipInfo = () => {
        if (!userProfile?.membership_plan) {
            return {
                packageName: 'Chưa đăng ký',
                startDate: null,
                endDate: null,
                daysRemaining: 0,
                totalDays: 0,
                isActive: false
            };
        }

        const startDate = new Date(userProfile.membership_start_date);
        const endDate = new Date(userProfile.membership_end_date);
        const today = new Date();
        
        const timeDiff = endDate.getTime() - today.getTime();
        const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        
        const totalTimeDiff = endDate.getTime() - startDate.getTime();
        const totalDays = Math.ceil(totalTimeDiff / (1000 * 3600 * 24));

        return {
            packageName: userProfile.membership_plan,
            startDate: startDate.toLocaleDateString('vi-VN'),
            endDate: endDate.toLocaleDateString('vi-VN'),
            daysRemaining,
            totalDays,
            isActive: daysRemaining > 0
        };
    };

    const membership = getMembershipInfo();

    // const todaysClasses = [
    //     { time: '18:00', name: 'Lớp Yoga Flow', type: 'yoga', trainer: 'HLV Anna' },
    //     { time: '19:30', name: 'Tập PT 1:1', type: 'pt', trainer: 'HLV Dũng' },
    // ];
    // const todaysClasses = []; // Thử trường hợp không có lịch tập

    return (
        <div className="md-container fade-in">
            {loading ? (
                <div className="md-loading">
                    <p>Đang tải thông tin...</p>
                </div>
            ) : (
                <>
                    {/* --- KHU VỰC CHÀO MỪNG --- */}
            <div className="md-header">
                <img 
                    src={getAvatarUrl(userProfile?.avatar_url)} 
                    alt="Avatar" 
                    className="md-avatar"
                    onError={(e) => {
                        e.target.src = 'https://placehold.co/100x100/333333/FFFFFF?text=User';
                    }}
                />
                <div className="md-header-text">
                    <h1>Chào mừng, {userProfile?.name || user?.name || 'bạn'}!</h1>
                    <p>Sẵn sàng cho một buổi tập tuyệt vời nào!</p>
                </div>
            </div>

            {/* --- LƯỚI THÔNG TIN CHÍNH --- */}
            <div className="md-grid">
                {/* THẺ GÓI TẬP */}
                <div className="md-card">
                    <h3 className="md-card-header">
                        <FontAwesomeIcon icon={faCrown} /> Gói tập của bạn
                    </h3>
                    {membership.isActive ? (
                        <div className="md-package-info">
                            <div className="md-package-row">
                                <span className="md-package-label">Tên gói</span>
                                <span className="md-package-name">{membership.packageName}</span>
                            </div>
                            <div className="md-package-row">
                                <span className="md-package-label">Thời gian còn lại</span>
                                <span className="md-days-remaining">
                                    {membership.daysRemaining} ngày
                                </span>
                            </div>
                            <div className="md-package-row">
                                <span className="md-package-label">Ngày bắt đầu</span>
                                <span className="md-package-value">{membership.startDate}</span>
                            </div>
                            <div className="md-package-row">
                                <span className="md-package-label">Ngày kết thúc</span>
                                <span className="md-package-value">{membership.endDate}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="md-no-membership">
                            <p>Bạn chưa đăng ký gói tập nào</p>
                            <button className="md-btn-primary" onClick={() => window.location.href = '/member/packages'}>
                                Đăng ký ngay
                            </button>
                        </div>
                    )}
                </div>

                {/* THẺ LỊCH TẬP HÔM NAY */}
                <div className="md-card">
                    <h3 className="md-card-header">
                        <FontAwesomeIcon icon={faCalendarCheck} /> Lịch tập hôm nay
                    </h3>
                    <div className="md-schedule-list">
                        {todaysClasses.length > 0 ? (
                            todaysClasses.map((item, index) => (
                                <div key={index} className="md-session-item">
                                    <div className={`md-session-icon md-type-yoga`}>
                                        <FontAwesomeIcon icon={faDumbbell} />
                                    </div>
                                    <div className="md-session-info">
                                        <span className="md-session-name">{item.class_name}</span>
                                        <span className="md-trainer-name">
                                            {item.trainer_name ? `HLV ${item.trainer_name}` : 'Chưa có HLV'}
                                        </span>
                                        {item.room && (
                                            <span className="md-session-location">
                                                {item.floor && `Tầng ${item.floor}, `}Phòng {item.room}
                                            </span>
                                        )}
                                    </div>
                                    <span className="md-session-time">
                                        {item.start_time ? item.start_time.substring(0, 5) : '--:--'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="md-no-schedule">
                                <p>Hôm nay bạn không có lịch tập nào.</p>
                                <button className="md-btn-secondary" onClick={() => window.location.href = '/member/schedule'}>
                                    Xem lịch tập
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* THẺ MEMBERSHIP CARD & QR */}
                <div className="md-membership-card-wrapper">
                    {/* Credit Card Style */}
                    <div className="md-credit-card">
                        <div className="md-card-gym-name">ROYAL FITNESS</div>
                        <div className="md-card-chip"></div>
                        <div className="md-card-number">
                            {user?.id ? String(user.id).padStart(16, '0').match(/.{1,4}/g).join(' ') : '**** **** **** ****'}
                        </div>
                        <div className="md-card-bottom">
                            <div className="md-card-holder">
                                <div className="md-card-label">Thành viên</div>
                                <div className="md-card-name">
                                    {(userProfile?.name || user?.name || 'Member').toUpperCase()}
                                </div>
                            </div>
                            <div className="md-card-logo">VIP</div>
                        </div>
                    </div>

                    {/* Check-in Section */}
                    <div className="md-checkin-section" onClick={() => setShowQRModal(true)}>
                        <div className="md-checkin-label">Mã Check-in</div>
                        <button className="md-checkin-btn">
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            Hiển thị QR Code
                        </button>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQRModal && (
                <div className="md-qr-modal" onClick={() => setShowQRModal(false)}>
                    <div className="md-qr-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="md-close-x-btn" onClick={() => setShowQRModal(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        
                        <div className="md-qr-modal-header">
                            <FontAwesomeIcon icon={faQrcode} className="md-qr-icon" />
                            <h3>Mã Check-in</h3>
                        </div>
                        
                        <p className="md-qr-description">Quét mã QR này tại quầy lễ tân để check-in vào phòng gym</p>
                        
                        <div className="md-qr-wrapper">
                            <QRCodeSVG
                                value={user?.id || "member-123456"}
                                size={220}
                                level="H"
                                bgColor="#ffffff"
                                fgColor="#000000"
                                includeMargin={true}
                            />
                        </div>
                    </div>
                </div>
            )}
                </>
            )}
        </div>
    );
};

export default Dashboard;

