import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { FaDumbbell, FaUsers, FaChalkboardTeacher, FaClock, FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';

// Import file CSS mới
import './css/Login.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Điều hướng về trang trước đó hoặc trang chủ sau khi đăng nhập
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(location.state?.message || ""); // Nhận thông báo từ trang đăng ký
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(form);
      // Điều hướng dựa trên role của user
      if (data.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (data.user.role === "member") {
        navigate("/member/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Left Section - Branding */}
      <div className="login-left-section">
        <div className="branding-content">
          <div className="logo-section">
            <h1 className="brand-name">
              Royal <span className="brand-highlight">Fitness</span>
            </h1>
          </div>

          <div className="hero-content">
            <h2 className="hero-title">
              Build Your<br />
              <span className="hero-highlight">Dream Physique</span>
            </h2>
            <p className="hero-description">
              Dynamic fitness hub equipped with cutting-edge machines, vibrant atmosphere, 
              and expert trainers for optimal workouts.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <div className="stat-info">
                <div className="stat-number">500+</div>
                <div className="stat-label">MEMBERS</div>
              </div>
            </div>
            <div className="stat-item">
              <FaChalkboardTeacher className="stat-icon" />
              <div className="stat-info">
                <div className="stat-number">50+</div>
                <div className="stat-label">TRAINERS</div>
              </div>
            </div>
            <div className="stat-item">
              <FaClock className="stat-icon" />
              <div className="stat-info">
                <div className="stat-number">24/7</div>
                <div className="stat-label">ACCESS</div>
              </div>
            </div>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <FaDumbbell className="feature-icon" />
              <span>State-of-the-art equipment & facilities</span>
            </div>
            <div className="feature-item">
              <FaDumbbell className="feature-icon" />
              <span>Personalized training programs</span>
            </div>
            <div className="feature-item">
              <FaDumbbell className="feature-icon" />
              <span>Expert coaches & nutritionists</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="login-right-section">
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Login to continue your fitness journey</p>
          </div>

          {error && (
            <div className="login-error">
              <p>{error}</p>
            </div>
          )}

          <form className="login-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="email">EMAIL ADDRESS</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                className="form-input"
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  className="form-input"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input 
                  id="remember-me" 
                  name="remember-me" 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password-btn">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'SIGNING IN...' : 'LOGIN NOW'}
            </button>

            <div className="divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <div className="social-login-buttons">
              <button type="button" className="social-btn google-btn">
                <FaGoogle />
                <span>Google</span>
              </button>
              <button type="button" className="social-btn facebook-btn">
                <FaFacebook />
                <span>Facebook</span>
              </button>
            </div>

            <p className="register-link">
              Don't have an account? <Link to="/register">Sign Up Free</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
