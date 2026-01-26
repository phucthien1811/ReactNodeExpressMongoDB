import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import Button from "./Button";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import memberProfileService from "../../services/memberProfileService.js";
import "./Header.css";

function Header() {
  const links = [
    { label: "Trang Chủ", href: "#home" },
    { label: "Dịch Vụ", href: "#services" },
    { label: "Giới Thiệu", href: "#about" },
    { label: "Gói Tập", href: "#pricing" },
    { label: "Đánh Giá", href: "#review" },
    { label: "Cửa Hàng", href: "/shop", isRoute: true },
  ];

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userName, setUserName] = useState(null);

  console.log('🔍 Header: Render with user:', user);
  console.log('🔍 Header: Current userAvatar state:', userAvatar);
  console.log('🔍 Header: Current userName state:', userName);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
  };

  // Fetch user avatar
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          console.log('🔍 Header: Fetching user profile...');
          const response = await memberProfileService.getProfile();
          console.log('📥 Header: Profile response:', response);
          if (response.success && response.data) {
            if (response.data.avatar_url) {
              console.log('✅ Header: Setting avatar:', response.data.avatar_url);
              setUserAvatar(response.data.avatar_url);
            }
            // Set user name from profile (name field from users table)
            if (response.data.name) {
              console.log('✅ Header: Setting userName:', response.data.name);
              setUserName(response.data.name);
            }
          } else {
            console.log('❌ Header: No profile data found in response');
          }
        } catch (error) {
          console.error('❌ Header: Error fetching user profile:', error);
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  // Helper function to get full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('blob:') || avatarPath.startsWith('http')) return avatarPath;
    const filename = avatarPath.replace('/uploads/avatars/', '');
    return `http://localhost:4000/api/v1/uploads/avatars/${filename}`;
  };

  const getUserDashboardLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "member") return "/member/dashboard";
    return "/";
  };

  const handleNavigation = (href, isRoute = false) => {
    if (isRoute) {
      // For route links like /shop, navigate normally
      navigate(href);
    } else {
      // For hash links, navigate to home first then scroll
      const currentPath = window.location.pathname;
      if (currentPath !== '/') {
        // If not on homepage, navigate to home first
        navigate('/');
        // Wait for navigation to complete, then scroll
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // If already on homepage, just scroll
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-menu-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="site-header glass">
      <div className="container header__inner">
        <button onClick={handleLogoClick} className="logo" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="logo__main">Royal</span>
          <span className="logo__accent">Fitness</span>
        </button>

        {/* KHÔNG truyền cta nữa */}
        <Navigation links={links} className="header__nav" onNavigate={handleNavigation} />

        <div className="header__extra" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Cart Icon */}
          <Link 
            to="/cart" 
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              color: "#4CAF50",
              textDecoration: "none",
              padding: "8px",
              borderRadius: "6px",
              transition: "background-color 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(76, 175, 80, 0.1)"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            {totalItems > 0 && (
              <span 
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#ff4444",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "20px"
                }}
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {!user ? (
            <Button as={Link} to="/login" variant="outline" size="sm">
              Login
            </Button>
          ) : (
            <div className="user-menu-container" style={{ position: "relative" }}>
              <button 
                className="user-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4CAF50",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(76, 175, 80, 0.1)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                <div 
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: userAvatar ? "transparent" : "linear-gradient(45deg, #4CAF50, #45a049)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    overflow: "hidden"
                  }}
                >
                  {userAvatar ? (
                    <img 
                      src={getAvatarUrl(userAvatar)} 
                      alt="Avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%"
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
                        e.target.parentNode.innerHTML = (userName || user.name)?.charAt(0).toUpperCase() || "U";
                      }}
                    />
                  ) : (
                    (userName || user.name)?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {userName || user.name || "User"}
                </span>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="currentColor"
                  style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
                >
                  <path d="M6 8L10 4H2L6 8Z"/>
                </svg>
              </button>
              
              {dropdownOpen && (
                <div 
                  className="user-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    marginTop: "8px",
                    background: "#1e1e1e",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                    minWidth: "200px",
                    zIndex: 1000
                  }}
                >
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                      {userName || user.name || "User"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                      {user.email}
                    </div>
                    <div style={{ fontSize: "11px", color: "#4CAF50", marginTop: "4px", textTransform: "uppercase" }}>
                      {user.role}
                    </div>
                  </div>
                  
                  <div style={{ padding: "8px 0" }}>
                    <Link
                      to={getUserDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: "block",
                        padding: "10px 16px",
                        color: "#e0e0e0",
                        textDecoration: "none",
                        fontSize: "14px",
                        textAlign: "left",
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      Trang Cá Nhân
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        background: "none",
                        border: "none",
                        color: "#ff6b6b",
                        textAlign: "left",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255, 107, 107, 0.1)"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      Đăng Xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="header__divider" />
    </header>
  );
}

export default Header;
