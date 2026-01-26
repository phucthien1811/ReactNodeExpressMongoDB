import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFacebook, 
  faYoutube, 
  faInstagram,
  faTwitter 
} from "@fortawesome/free-brands-svg-icons";
import { 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope 
} from "@fortawesome/free-solid-svg-icons";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          {/* Logo & Mô tả */}
          <div className="footer-section">
            <h3 className="footer-logo">
              Royal <span className="text-brand">Fitness</span>
            </h3>
            <p className="footer-desc">
              Nâng tầm thể chất, kiến tạo phong độ cùng Royal Fitness - 
              Hệ thống phòng gym hiện đại với huấn luyện viên chuyên nghiệp.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FontAwesomeIcon icon={faYoutube} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="footer-section">
            <h4 className="footer-title">Liên Hệ</h4>
            <ul className="footer-list">
              <li>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="footer-icon" />
                <span>280 An Dương Vương, Quận 5,<br />Thành Phố Hồ Chí Minh</span>
              </li>
              <li>
                <FontAwesomeIcon icon={faPhone} className="footer-icon" />
                <span>0123 456 789</span>
              </li>
              <li>
                <FontAwesomeIcon icon={faEnvelope} className="footer-icon" />
                <span>support@royalfitness.vn</span>
              </li>
            </ul>
          </div>

          {/* Liên kết nhanh */}
          <div className="footer-section">
            <h4 className="footer-title">Liên Kết Nhanh</h4>
            <ul className="footer-links">
              <li><a href="#about">Về Chúng Tôi</a></li>
              <li><a href="#services">Dịch Vụ</a></li>
              <li><a href="#pricing">Gói Tập</a></li>
              <li><a href="#review">Đánh Giá</a></li>
              <li><a href="/shop">Cửa Hàng</a></li>
            </ul>
          </div>

          {/* Chính sách */}
          <div className="footer-section">
            <h4 className="footer-title">Chính Sách</h4>
            <ul className="footer-links">
              <li><a href="#privacy">Chính Sách Bảo Mật</a></li>
              <li><a href="#terms">Điều Khoản & Điều Kiện</a></li>
              <li><a href="#customer-care">Chăm Sóc Khách Hàng</a></li>
              <li><a href="#refund">Chính Sách Hoàn Tiền</a></li>
              <li><a href="#faq">Câu Hỏi Thường Gặp</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Royal <span className="text-brand">Fitness</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
