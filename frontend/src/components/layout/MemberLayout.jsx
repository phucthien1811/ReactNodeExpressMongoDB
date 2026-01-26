import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import memberProfileService from '../../services/memberProfileService.js';
import './css/MemberLayout.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faUserCircle, faCalendarAlt, faClipboardCheck, 
     faBoxOpen, faReceipt, faSignOutAlt, faBell,
    faIdCard, faHouse 
} from '@fortawesome/free-solid-svg-icons';

const MemberLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userAvatar, setUserAvatar] = useState(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };


    useEffect(() => {
        if (user) {
            const fetchUserProfile = async () => {
                try {
                    const response = await memberProfileService.getProfile();
                    if (response.success && response.data?.avatar_url) {
                        setUserAvatar(response.data.avatar_url);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            };
            fetchUserProfile();
        }
    }, [user]);

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;
        if (avatarPath.startsWith('blob:') || avatarPath.startsWith('http')) return avatarPath;
        const filename = avatarPath.replace('/uploads/avatars/', '');
        return `http://localhost:4000/api/v1/uploads/avatars/${filename}`;
    };

    const menuItems = [
        {
            title: "Trang cá nhân",
            items: [
                { name: "Trang Chủ", path: "/member/dashboard", icon: faTachometerAlt },
                { name: "Hồ sơ", path: "/member/profile", icon: faUserCircle }
            ]
        },
        {
            title: "Hoạt động tập luyện",
            items: [
                { name: "Lịch tập", path: "/member/schedule", icon: faCalendarAlt },
                { name: "Đặt lớp", path: "/member/book-class", icon: faClipboardCheck },
                // { name: "Tiến trình", path: "/member/progress", icon: faChartLine }
            ]
        },
        {
            title: "Đơn hàng & Giao dịch",
            items: [
                { name: "Gói tập", path: "/member/packages", icon: faIdCard },
                { name: "Đơn hàng của tôi", path: "/member/orders", icon: faBoxOpen },
                { name: "Lịch sử giao dịch", path: "/member/transactions", icon: faReceipt }
            ]
        }
    ];

    return (
        <div className="member-layout">
            <header className="member-header">
                <div className="header-brand">
                    <span>Royal Fitness</span>
                </div>
                <div className="header-actions">
                    <button className="notification-bell">
                        <FontAwesomeIcon icon={faBell} />
                        <span className="notification-dot"></span>
                    </button>
                    <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
                         <img 
                            src={userAvatar ? getAvatarUrl(userAvatar) : 'https://placehold.co/100x100/333333/FFFFFF?text=User'} 
                            alt="Avatar" 
                            className="header-avatar"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/100x100/333333/FFFFFF?text=User';
                            }}
                        />
                         {dropdownOpen && (
                            <div className="user-dropdown">
                                <div className="dropdown-user-info">
                                    <strong>{user?.name || 'Nguyễn Văn A'}</strong>
                                    <small>{user?.email || 'member@email.com'}</small>
                                </div>
                                <Link to="/" className="dropdown-item">
                                    <FontAwesomeIcon icon={faHouse} />
                                    <span>Quay về Website</span>
                                </Link>
                                <button onClick={handleLogout} className="dropdown-item">
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                         )}
                    </div>
                </div>
            </header>
            
            <aside className="member-sidebar">
                <nav className="member-nav">
                    {menuItems.map((section, index) => (
                        <div key={index} className="nav-section">
                            <h3 className="nav-section-title">{section.title}</h3>
                            <div className="nav-section-items">
                                {section.items.map((item, itemIndex) => (
                                    <NavLink
                                        key={itemIndex}
                                        to={item.path}
                                        end={item.path === "/member/dashboard"}
                                        className="nav-item-link"
                                    >
                                        <FontAwesomeIcon icon={item.icon} className="nav-item-icon" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="member-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MemberLayout;

