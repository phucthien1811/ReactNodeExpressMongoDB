import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/MemberPackages.css';
import PackageService from '../../services/packageService';

const MemberPackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [packageHistory, setPackageHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetchPublicPackages();
    fetchCurrentPackage();
    fetchPackageHistory();
  }, []);

  const fetchPublicPackages = async () => {
    try {
      const data = await PackageService.getPublicPackages();
      if (data.success) {
        setPackages(data.data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchCurrentPackage = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || 1;
      const data = await PackageService.getCurrentPackage(userId);
      if (data.success && data.data) {
        setCurrentPackage(data.data);
      }
    } catch (error) {
      console.error('Error fetching current package:', error);
    }
  };

  const fetchPackageHistory = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || 1;
      const data = await PackageService.getMemberPackages(userId);
      if (data.success) {
        setPackageHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching package history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (packageData) => {
    try {
      // Lấy user từ localStorage (được lưu khi đăng nhập)
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || 1; // Fallback to 1 if no user data
      
      console.log('Current user:', userData);
      console.log('Using user ID:', userId);
      
      const result = await PackageService.registerPackage({
        user_id: parseInt(userId), // Changed from member_id to user_id
        package_id: packageData.id,
        paid_amount: packageData.price
      });

      if (result.success) {
        alert('Đăng ký gói tập thành công!');
        setShowRegisterModal(false);
        fetchCurrentPackage();
        fetchPackageHistory();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error registering package:', error);
      alert('Có lỗi xảy ra khi đăng ký gói tập');
    }
  };

  const openRegisterModal = (pkg) => {
    // Navigate to checkout page instead of modal
    navigate('/member/packages/checkout', { state: { package: pkg } });
  };

  const getDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mpk-packages-page-container">
      <h2 className="mpk-admin-page-title">Gói tập của tôi</h2>

      {/* Current Package Section */}
      {currentPackage ? (
        <div className="mpk-current-package-wrapper">
          {/* Left Column - Package Card */}
          <div className="mpk-package-info-card">
            <div className="mpk-package-card-header">
              <h3 className="mpk-package-title">{currentPackage.package_name}</h3>
              <span className="mpk-package-badge">Đang hoạt động</span>
            </div>
            
            <div className="mpk-package-card-body">
              <div className="mpk-package-benefits">
                <h4 className="mpk-benefits-title">Quyền lợi gói tập</h4>
                <ul className="mpk-benefits-list">
                  {(Array.isArray(currentPackage.features) ? currentPackage.features : []).map((benefit, index) => (
                    <li key={index} className="mpk-benefit-item">
                      <svg className="mpk-check-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Time & Actions */}
          <div className="mpk-package-actions-card">
            <div className="mpk-time-remaining">
              <div className="mpk-time-label">Thời hạn còn lại</div>
              <div className="mpk-time-value">{getDaysLeft(currentPackage.end_date)}</div>
              <div className="mpk-time-unit">ngày</div>
              <div className="mpk-time-dates">
                <div className="mpk-date-info">
                  <span className="mpk-date-label">Bắt đầu:</span>
                  <span className="mpk-date-value">{new Date(currentPackage.start_date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="mpk-date-info">
                  <span className="mpk-date-label">Kết thúc:</span>
                  <span className="mpk-date-value">{new Date(currentPackage.end_date).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
            
            <div className="mpk-action-buttons">
              <button className="mpk-btn-renew">
                <svg className="mpk-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Gia hạn
              </button>
              <button 
                className="mpk-btn-history"
                onClick={() => setShowHistoryModal(true)}
              >
                <svg className="mpk-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Xem lịch sử gói tập
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mpk-packages-page-container">
          <p className="mpk-page-subtitle">Chọn gói tập phù hợp với nhu cầu của bạn</p>
          
          <div className="mpk-packages-grid">
            {packages.map((pkg, index) => (
              <div 
                key={pkg.id} 
                className={`mpk-package-card ${index === 1 ? 'mpk-recommended' : ''}`}
              >
                {index === 1 && <div className="mpk-recommended-badge">Phổ biến nhất</div>}
                
                <div className="mpk-package-header">
                  <h3 className="mpk-package-name">{pkg.name}</h3>
                  {pkg.description && <p className="mpk-package-description">{pkg.description}</p>}
                </div>

                <div className="mpk-package-price">
                  {pkg.price.toLocaleString('vi-VN')}đ
                  <span className="mpk-package-duration">/ {Math.floor(pkg.duration_days / 30)} tháng</span>
                </div>

                <ul className="mpk-package-features">
                  {(Array.isArray(pkg.features) ? pkg.features : []).map((feature, index) => (
                    <li key={index}>
                      <span className="mpk-feature-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mpk-package-footer">
                  <button 
                    className="mpk-btn-primary"
                    onClick={() => openRegisterModal(pkg)}
                  >
                    Đăng Ký Ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="mpk-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="mpk-modal-content mpk-history-modal" onClick={e => e.stopPropagation()}>
            <div className="mpk-modal-header">
              <h3>Lịch sử gói tập</h3>
              <button 
                className="mpk-modal-close"
                onClick={() => setShowHistoryModal(false)}
              >×</button>
            </div>
            
            <div className="mpk-modal-body">
              <div className="mpk-history-table-wrapper">
                <table className="mpk-history-table">
                  <thead>
                    <tr>
                      <th>Gói tập</th>
                      <th>Ngày bắt đầu</th>
                      <th>Ngày kết thúc</th>
                      <th>Trạng thái</th>
                      <th>Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packageHistory.map((pkg, index) => (
                      <tr key={index}>
                        <td>
                          <div className="mpk-package-name-cell">{pkg.package_name}</div>
                        </td>
                        <td>{new Date(pkg.start_date).toLocaleDateString('vi-VN')}</td>
                        <td>{new Date(pkg.end_date).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <span className={`mpk-status-badge ${
                            pkg.status === 'active' 
                              ? 'mpk-status-active'
                              : pkg.status === 'expired'
                              ? 'mpk-status-expired'
                              : 'mpk-status-cancelled'
                          }`}>
                            {pkg.status === 'active' ? 'Đang sử dụng' : 
                             pkg.status === 'expired' ? 'Đã hết hạn' : 'Đã hủy'}
                          </span>
                        </td>
                        <td>
                          <div className="mpk-amount-cell">{pkg.paid_amount.toLocaleString('vi-VN')}đ</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {packageHistory.length === 0 && (
                  <div className="mpk-empty-history">
                    <svg className="mpk-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Chưa có lịch sử gói tập</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && selectedPackage && (
        <div className="mpk-modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="mpk-modal-content" onClick={e => e.stopPropagation()}>
            <div className="mpk-modal-header">
              <h3>Xác nhận đăng ký gói tập</h3>
              <button 
                className="mpk-modal-close"
                onClick={() => setShowRegisterModal(false)}
              >×</button>
            </div>
            
            <div className="mpk-register-package-details">
              <h4>{selectedPackage.name}</h4>
              <p className="mpk-package-price-large">
                {selectedPackage.price.toLocaleString('vi-VN')}đ
              </p>
              <p>Thời hạn: {Math.floor(selectedPackage.duration_days / 30)} tháng</p>
              
              <div className="mpk-package-features-summary">
                <h5>Quyền lợi bao gồm:</h5>
                <ul>
                  {(Array.isArray(selectedPackage.features) ? selectedPackage.features : []).map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mpk-modal-footer">
              <button 
                type="button" 
                onClick={() => setShowRegisterModal(false)} 
                className="mpk-btn-secondary"
              >
                Hủy
              </button>
              <button 
                type="button"
                onClick={() => handleRegister(selectedPackage)}
                className="mpk-btn-primary"
              >
                Xác nhận đăng ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberPackages;