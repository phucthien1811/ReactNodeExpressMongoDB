//frontend/src/components/layout/AdminLayout.jsx

import React from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import "./css/AdminLayout.css";
import { useAuth } from "../../context/AuthContext.jsx";

// Import Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faGaugeHigh, faUsers, faArrowRightFromBracket, faHouse, faUserTie,
    faCalendarDays, faIdCard, faFileInvoiceDollar, faChartLine,
    faBoxOpen, faReceipt, faGears
} from '@fortawesome/free-solid-svg-icons';

// A simple component for section headings in the nav
const NavSectionTitle = ({ title }) => (
    <div className="admin__nav-title">{title}</div>
);

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="admin admin-theme">
      <aside className="admin__side">
        <div className="admin__brand">Admin Page</div>
        <nav className="admin__nav">
          
          {/* OVERVIEW */}
          <NavSectionTitle title="TỔNG QUAN" />
          <NavLink end to="/admin" className="admin__link">
            <FontAwesomeIcon icon={faGaugeHigh} className="admin__link-icon" />
            Thống kê
          </NavLink>

          {/* CORE MANAGEMENT */}
          <NavSectionTitle title="QUẢN LÍ" />
          <NavLink to="/admin/members" className="admin__link">
            <FontAwesomeIcon icon={faUsers} className="admin__link-icon" />
            Thành Viên
          </NavLink>
          <NavLink to="/admin/trainers" className="admin__link">
            <FontAwesomeIcon icon={faUserTie} className="admin__link-icon" />
            Huấn Luyện Viên
          </NavLink>
          <NavLink to="/admin/classes" className="admin__link">
            <FontAwesomeIcon icon={faCalendarDays} className="admin__link-icon" />
            Lịch Tập 
          </NavLink>
          <NavLink to="/admin/plans" className="admin__link">
            <FontAwesomeIcon icon={faIdCard} className="admin__link-icon" />
            Gói Thành Viên
          </NavLink>

          {/* FINANCIAL */}
          <NavSectionTitle title="TÀI CHÍNH" />
          <NavLink to="/admin/invoices" className="admin__link">
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="admin__link-icon" />
            Hóa Đơn
          </NavLink>
          
          
          {/* POINT OF SALE */}
          <NavSectionTitle title="CỬA HÀNG" />
           <NavLink to="/admin/products" className="admin__link">
            <FontAwesomeIcon icon={faBoxOpen} className="admin__link-icon" />
            Sản Phẩm
          </NavLink>
          <NavLink to="/admin/orders" className="admin__link">
            <FontAwesomeIcon icon={faReceipt} className="admin__link-icon" />
            Đơn Hàng
          </NavLink>

          {/* SYSTEM */}
          <NavSectionTitle title="SYSTEM" />
          <NavLink to="/admin/voucher" className="admin__link">
            <FontAwesomeIcon icon={faChartLine} className="admin__link-icon" />
            Voucher
          </NavLink>
          <NavLink to="/admin/settings" className="admin__link">
            <FontAwesomeIcon icon={faGears} className="admin__link-icon" />
            Cài đặt
          </NavLink> 

          {/* Logout */}
          <button
            className="admin__link admin__link--danger"
            onClick={() => { logout(); nav("/"); }}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="admin__link-icon" />
            Đăng xuất
          </button>
        </nav>
      </aside>

      <div className="admin__main">
        <header className="admin__top">
          <Link to="/" className="admin__pill">
            <FontAwesomeIcon icon={faHouse} className="admin__pill-icon" />
            Back to Home
          </Link>
          <div className="admin__user">{user?.name || "Admin"}</div>
        </header>
        <div className="admin__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
