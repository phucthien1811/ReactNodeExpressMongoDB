import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBuilding, 
    faCreditCard, 
    faBell, 
    faClock,
    faShieldAlt,
    faSave
} from '@fortawesome/free-solid-svg-icons';
import './css/AdminSettings.css';

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        gymName: 'Royal Fitness Center',
        gymAddress: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        gymPhone: '028 3822 1234',
        gymEmail: 'contact@royalfitness.vn',
        gymWebsite: 'www.royalfitness.vn',
        openTime: '05:00',
        closeTime: '23:00',
        maxCapacity: 200,
        
        // Billing settings
        taxCode: '0123456789',
        bankName: 'Vietcombank',
        bankAccount: '0123456789012',
        accountHolder: 'ROYAL FITNESS CENTER',
        
        // Notification settings
        emailNotifications: true,
        smsNotifications: false,
        paymentReminder: true,
        expiryReminder: true,
        reminderDays: 7,
        
        // Security settings
        sessionTimeout: 30,
        passwordExpiry: 90,
        twoFactorAuth: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        console.log('Saving settings:', settings);
        alert('Lưu cài đặt thành công!');
    };

    return (
        <div className="as-admin-page-container">
            <div className="as-page-header">
                <h2 className="as-page-title">Cài Đặt Hệ Thống</h2>
                <p className="as-page-subtitle">Quản lý cấu hình và thông tin phòng gym của bạn</p>
            </div>

            <div className="as-settings-grid">
                {/* Navigation Sidebar */}
                <div className="as-settings-nav">
                    <button 
                        className={`as-nav-item ${activeTab === 'general' ? 'as-active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <FontAwesomeIcon icon={faBuilding} className="as-nav-icon" />
                        <span>Thông Tin Chung</span>
                    </button>
                    <button 
                        className={`as-nav-item ${activeTab === 'hours' ? 'as-active' : ''}`}
                        onClick={() => setActiveTab('hours')}
                    >
                        <FontAwesomeIcon icon={faClock} className="as-nav-icon" />
                        <span>Giờ Hoạt Động</span>
                    </button>
                    <button 
                        className={`as-nav-item ${activeTab === 'billing' ? 'as-active' : ''}`}
                        onClick={() => setActiveTab('billing')}
                    >
                        <FontAwesomeIcon icon={faCreditCard} className="as-nav-icon" />
                        <span>Thanh Toán</span>
                    </button>
                    <button 
                        className={`as-nav-item ${activeTab === 'notifications' ? 'as-active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <FontAwesomeIcon icon={faBell} className="as-nav-icon" />
                        <span>Thông Báo</span>
                    </button>
                    <button 
                        className={`as-nav-item ${activeTab === 'security' ? 'as-active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <FontAwesomeIcon icon={faShieldAlt} className="as-nav-icon" />
                        <span>Bảo Mật</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="as-settings-content">
                    <form onSubmit={handleSaveSettings}>
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="as-settings-card">
                                <div className="as-card-header">
                                    <FontAwesomeIcon icon={faBuilding} className="as-header-icon" />
                                    <h3 className="as-card-title">Thông Tin Phòng Gym</h3>
                                </div>
                                <div className="as-card-body">
                                    <div className="as-form-row">
                                        <div className="as-form-group">
                                            <label htmlFor="gymName">Tên phòng gym *</label>
                                            <input 
                                                type="text" 
                                                id="gymName" 
                                                name="gymName"
                                                value={settings.gymName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="as-form-group">
                                            <label htmlFor="gymPhone">Số điện thoại *</label>
                                            <input 
                                                type="tel" 
                                                id="gymPhone" 
                                                name="gymPhone"
                                                value={settings.gymPhone}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="as-form-group">
                                        <label htmlFor="gymAddress">Địa chỉ *</label>
                                        <input 
                                            type="text" 
                                            id="gymAddress" 
                                            name="gymAddress"
                                            value={settings.gymAddress}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="as-form-row">
                                        <div className="as-form-group">
                                            <label htmlFor="gymEmail">Email liên hệ *</label>
                                            <input 
                                                type="email" 
                                                id="gymEmail" 
                                                name="gymEmail"
                                                value={settings.gymEmail}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="as-form-group">
                                            <label htmlFor="gymWebsite">Website</label>
                                            <input 
                                                type="text" 
                                                id="gymWebsite" 
                                                name="gymWebsite"
                                                value={settings.gymWebsite}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="as-form-group">
                                        <label htmlFor="maxCapacity">Sức chứa tối đa (người)</label>
                                        <input 
                                            type="number" 
                                            id="maxCapacity" 
                                            name="maxCapacity"
                                            value={settings.maxCapacity}
                                            onChange={handleInputChange}
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hours Settings */}
                        {activeTab === 'hours' && (
                            <div className="as-settings-card">
                                <div className="as-card-header">
                                    <FontAwesomeIcon icon={faClock} className="as-header-icon" />
                                    <h3 className="as-card-title">Giờ Hoạt Động</h3>
                                </div>
                                <div className="as-card-body">
                                    <div className="as-form-row">
                                        <div className="as-form-group">
                                            <label htmlFor="openTime">Giờ mở cửa</label>
                                            <input 
                                                type="time" 
                                                id="openTime" 
                                                name="openTime"
                                                value={settings.openTime}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="as-form-group">
                                            <label htmlFor="closeTime">Giờ đóng cửa</label>
                                            <input 
                                                type="time" 
                                                id="closeTime" 
                                                name="closeTime"
                                                value={settings.closeTime}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="as-info-box">
                                        <FontAwesomeIcon icon={faClock} className="as-info-icon" />
                                        <div>
                                            <p className="as-info-title">Lưu ý về giờ hoạt động</p>
                                            <p className="as-info-text">Giờ hoạt động sẽ được hiển thị trên website và ứng dụng của bạn. Hội viên sẽ nhận thông báo nếu có thay đổi.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Billing Settings */}
                        {activeTab === 'billing' && (
                            <div className="as-settings-card">
                                <div className="as-card-header">
                                    <FontAwesomeIcon icon={faCreditCard} className="as-header-icon" />
                                    <h3 className="as-card-title">Thông Tin Thanh Toán</h3>
                                </div>
                                <div className="as-card-body">
                                    <div className="as-form-group">
                                        <label htmlFor="taxCode">Mã số thuế</label>
                                        <input 
                                            type="text" 
                                            id="taxCode" 
                                            name="taxCode"
                                            value={settings.taxCode}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="as-form-group">
                                        <label htmlFor="bankName">Ngân hàng</label>
                                        <input 
                                            type="text" 
                                            id="bankName" 
                                            name="bankName"
                                            value={settings.bankName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="as-form-row">
                                        <div className="as-form-group">
                                            <label htmlFor="bankAccount">Số tài khoản</label>
                                            <input 
                                                type="text" 
                                                id="bankAccount" 
                                                name="bankAccount"
                                                value={settings.bankAccount}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="as-form-group">
                                            <label htmlFor="accountHolder">Chủ tài khoản</label>
                                            <input 
                                                type="text" 
                                                id="accountHolder" 
                                                name="accountHolder"
                                                value={settings.accountHolder}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Settings */}
                        {activeTab === 'notifications' && (
                            <div className="as-settings-card">
                                <div className="as-card-header">
                                    <FontAwesomeIcon icon={faBell} className="as-header-icon" />
                                    <h3 className="as-card-title">Cài Đặt Thông Báo</h3>
                                </div>
                                <div className="as-card-body">
                                    <div className="as-toggle-group">
                                        <div className="as-toggle-item">
                                            <div className="as-toggle-info">
                                                <label htmlFor="emailNotifications">Thông báo qua Email</label>
                                                <p className="as-toggle-description">Gửi email thông báo cho hội viên</p>
                                            </div>
                                            <label className="as-toggle-switch">
                                                <input 
                                                    type="checkbox" 
                                                    id="emailNotifications"
                                                    name="emailNotifications"
                                                    checked={settings.emailNotifications}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="as-toggle-slider"></span>
                                            </label>
                                        </div>
                                        <div className="as-toggle-item">
                                            <div className="as-toggle-info">
                                                <label htmlFor="smsNotifications">Thông báo qua SMS</label>
                                                <p className="as-toggle-description">Gửi tin nhắn SMS cho hội viên</p>
                                            </div>
                                            <label className="as-toggle-switch">
                                                <input 
                                                    type="checkbox" 
                                                    id="smsNotifications"
                                                    name="smsNotifications"
                                                    checked={settings.smsNotifications}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="as-toggle-slider"></span>
                                            </label>
                                        </div>
                                        <div className="as-toggle-item">
                                            <div className="as-toggle-info">
                                                <label htmlFor="paymentReminder">Nhắc nhở thanh toán</label>
                                                <p className="as-toggle-description">Tự động nhắc hội viên thanh toán</p>
                                            </div>
                                            <label className="as-toggle-switch">
                                                <input 
                                                    type="checkbox" 
                                                    id="paymentReminder"
                                                    name="paymentReminder"
                                                    checked={settings.paymentReminder}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="as-toggle-slider"></span>
                                            </label>
                                        </div>
                                        <div className="as-toggle-item">
                                            <div className="as-toggle-info">
                                                <label htmlFor="expiryReminder">Nhắc gói tập sắp hết hạn</label>
                                                <p className="as-toggle-description">Thông báo trước khi gói tập hết hạn</p>
                                            </div>
                                            <label className="as-toggle-switch">
                                                <input 
                                                    type="checkbox" 
                                                    id="expiryReminder"
                                                    name="expiryReminder"
                                                    checked={settings.expiryReminder}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="as-toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="as-form-group">
                                        <label htmlFor="reminderDays">Nhắc trước (ngày)</label>
                                        <input 
                                            type="number" 
                                            id="reminderDays" 
                                            name="reminderDays"
                                            value={settings.reminderDays}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="30"
                                        />
                                        <small className="as-form-hint">Số ngày trước khi gửi nhắc nhở về hết hạn gói tập</small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="as-settings-card">
                                <div className="as-card-header">
                                    <FontAwesomeIcon icon={faShieldAlt} className="as-header-icon" />
                                    <h3 className="as-card-title">Bảo Mật Hệ Thống</h3>
                                </div>
                                <div className="as-card-body">
                                    <div className="as-form-group">
                                        <label htmlFor="sessionTimeout">Thời gian hết phiên (phút)</label>
                                        <input 
                                            type="number" 
                                            id="sessionTimeout" 
                                            name="sessionTimeout"
                                            value={settings.sessionTimeout}
                                            onChange={handleInputChange}
                                            min="5"
                                            max="120"
                                        />
                                        <small className="as-form-hint">Tự động đăng xuất sau thời gian không hoạt động</small>
                                    </div>
                                    <div className="as-form-group">
                                        <label htmlFor="passwordExpiry">Mật khẩu hết hạn sau (ngày)</label>
                                        <input 
                                            type="number" 
                                            id="passwordExpiry" 
                                            name="passwordExpiry"
                                            value={settings.passwordExpiry}
                                            onChange={handleInputChange}
                                            min="30"
                                            max="365"
                                        />
                                        <small className="as-form-hint">Yêu cầu đổi mật khẩu định kỳ</small>
                                    </div>
                                    <div className="as-toggle-group">
                                        <div className="as-toggle-item">
                                            <div className="as-toggle-info">
                                                <label htmlFor="twoFactorAuth">Xác thực 2 lớp (2FA)</label>
                                                <p className="as-toggle-description">Bật xác thực 2 lớp cho tài khoản admin</p>
                                            </div>
                                            <label className="as-toggle-switch">
                                                <input 
                                                    type="checkbox" 
                                                    id="twoFactorAuth"
                                                    name="twoFactorAuth"
                                                    checked={settings.twoFactorAuth}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="as-toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="as-form-actions">
                            <button type="submit" className="as-btn-save">
                                <FontAwesomeIcon icon={faSave} />
                                <span>Lưu Cài Đặt</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
