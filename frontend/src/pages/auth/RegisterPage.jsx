import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { FaDumbbell, FaUsers, FaChalkboardTeacher, FaClock, FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import './css/Register.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'member'
      });

      console.log('Registration successful:', response.data);
      
      navigate('/login', { 
        state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' }
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      {/* Left Section - Branding */}
      <div className="register-left-section">
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

      {/* Right Section - Register Form */}
      <div className="register-right-section">
        <div className="register-card">
          <div className="register-header">
            <h2 className="register-title">Join Royal Fitness</h2>
            <p className="register-subtitle">Start your fitness journey today</p>
          </div>

          {error && (
            <div className="register-error">
              <p>{error}</p>
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">FULL NAME</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">EMAIL ADDRESS</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="form-input"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="form-group">
              <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="form-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'CREATING ACCOUNT...' : 'SIGN UP FREE'}
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

            <p className="login-link">
              Already a member? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
