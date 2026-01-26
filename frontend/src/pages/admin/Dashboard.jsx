import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faDollarSign, 
    faUserPlus, 
    faCalendarCheck,
    faBoxOpen,
    faClock,
    faExclamationTriangle,
    faFire
} from '@fortawesome/free-solid-svg-icons';
import './css/Dashboard.css'; 

import {
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement,
    LineElement, 
    ArcElement,
    Title, 
    Tooltip, 
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement, 
    LineElement, 
    ArcElement,
    Title, 
    Tooltip, 
    Legend
);

const API_URL = 'http://localhost:4000/api/v1';

const AdminDashboard = () => {
    // State để lưu dữ liệu từ API
    const [stats, setStats] = useState({
        totalMembers: 0,
        revenue: 0,
        newMembers: 0,
        activeClasses: 0,
        totalProducts: 0,
        pendingOrders: 0,
        lowStockProducts: 0
    });
    const [recentMembers, setRecentMembers] = useState([]);
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState(Array(12).fill(0));
    const [newMembersChartData, setNewMembersChartData] = useState([]);
    const [packageChartData, setPackageChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Cập nhật đồng hồ mỗi giây
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Lấy dữ liệu thống kê từ API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                // Gọi API dashboard tổng hợp
                const dashboardResponse = await fetch(`${API_URL}/dashboard/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (dashboardResponse.ok) {
                    const dashboardData = await dashboardResponse.json();
                    console.log('📊 Dashboard data:', dashboardData);
                    
                    if (dashboardData.success) {
                        const data = dashboardData.data;
                        
                        // Cập nhật stats
                        setStats({
                            totalMembers: data.stats.totalMembers || 0,
                            revenue: data.stats.totalRevenue || 0,
                            newMembers: data.stats.newMembers || 0,
                            activeClasses: data.stats.activeClasses || 0,
                            totalProducts: data.stats.totalProducts || 0,
                            pendingOrders: data.stats.pendingOrders || 0,
                            lowStockProducts: data.stats.lowStockProducts || 0
                        });

                        // Cập nhật hội viên mới
                        if (data.recentMembers) {
                            setRecentMembers(data.recentMembers.map(member => ({
                                id: member.id,
                                name: member.name,
                                joinDate: new Date(member.created_at).toLocaleDateString('vi-VN'),
                                plan: member.package_name || 'Chưa đăng ký',
                                status: member.membership_status || 'active'
                            })));
                        }

                        // Cập nhật lịch học hôm nay
                        if (data.todaySchedules) {
                            setUpcomingClasses(data.todaySchedules.map(schedule => ({
                                id: schedule.id,
                                name: schedule.class_name,
                                time: schedule.start_time,
                                date: new Date(schedule.class_date).toLocaleDateString('vi-VN'),
                                trainer: schedule.trainer_name || 'Chưa phân công',
                                participants: schedule.current_participants || 0,
                                maxParticipants: schedule.max_participants || 20
                            })));
                        }

                        // Cập nhật alerts
                        if (data.alerts) {
                            setAlerts(data.alerts);
                        }

                        // Cập nhật doanh thu theo tháng
                        if (data.monthlyRevenue) {
                            setMonthlyRevenue(data.monthlyRevenue);
                        }

                        // Cập nhật hội viên mới 6 tháng
                        if (data.newMembersLast6Months) {
                            setNewMembersChartData(data.newMembersLast6Months);
                        }

                        // Cập nhật phân bổ gói tập
                        if (data.packageDistribution) {
                            setPackageChartData(data.packageDistribution);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Tạo labels và data cho biểu đồ hội viên mới (6 tháng gần nhất)
    const monthNames = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
    
    // Tạo mảng 6 tháng gần nhất
    const getLast6Months = () => {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                label: monthNames[date.getMonth()]
            });
        }
        return months;
    };

    const last6Months = getLast6Months();
    
    // Map data từ API vào 6 tháng gần nhất
    const newMembersLabels = last6Months.map(m => m.label);
    const newMembersCounts = last6Months.map(monthInfo => {
        const found = newMembersChartData.find(
            item => item.year === monthInfo.year && item.month === monthInfo.month
        );
        return found ? parseInt(found.count) : 0;
    });

    const revenueData = {
        labels: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
        datasets: [{
            label: 'Doanh thu (triệu VND)',
            data: monthlyRevenue.map(revenue => (revenue / 1000000).toFixed(1)),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 4,
        }],
    };

    const newMembersData = {
        labels: newMembersLabels,
        datasets: [{
            label: 'Hội viên mới',
            data: newMembersCounts,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#9ca3af' } } },
        scales: {
            y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
            x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
        },
    };

    // Biểu đồ phân bổ gói tập (real data)
    const packageLabels = packageChartData.map(item => item.name);
    const packageCounts = packageChartData.map(item => parseInt(item.count));
    
    // Màu sắc động dựa trên số lượng packages
    const packageColors = [
        'rgba(239, 68, 68, 0.8)',   // Red
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(245, 158, 11, 0.8)',  // Orange
        'rgba(16, 185, 129, 0.8)',  // Green
        'rgba(139, 92, 246, 0.8)',  // Purple
    ];

    const packageDistribution = {
        labels: packageLabels.length > 0 ? packageLabels : ['Chưa có dữ liệu'],
        datasets: [{
            data: packageCounts.length > 0 ? packageCounts : [1],
            backgroundColor: packageColors.slice(0, packageLabels.length),
            borderWidth: 0,
        }],
    };

    // Hiển thị loading
    if (loading) {
        return (
            <div className="db-admin-dashboard-container">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    fontSize: '18px',
                    color: '#6b7280'
                }}>
                    <FontAwesomeIcon icon={faClock} spin style={{ marginRight: '10px' }} />
                    Đang tải dữ liệu...
                </div>
            </div>
        );
    }

    return (
        <div className="db-admin-dashboard-container">
            {/* Header */}
            <div className="db-dashboard-header">
                <div>
                    <h1 className="db-dashboard-title">Dashboard Tổng Quan</h1>
                    <p className="db-dashboard-subtitle">Chào mừng quay trở lại! Đây là tổng quan hệ thống của bạn.</p>
                </div>
                <div className="db-header-actions">
                    <span className="db-last-updated">
                        Thành phố Hồ Chí Minh - {currentTime.toLocaleDateString('vi-VN', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                        })} {currentTime.toLocaleTimeString('vi-VN')}
                    </span>
                </div>
            </div>

            {/* Thẻ thống kê chính */}
            <div className="db-stats-grid">
                <div className="db-stat-card db-stat-primary">
                    <div className="db-stat-icon-wrapper">
                        <FontAwesomeIcon icon={faUsers} className="db-stat-icon" />
                    </div>
                    <div className="db-stat-info">
                        <p className="db-stat-label">Tổng Hội Viên</p>
                        <p className="db-stat-value">{stats.totalMembers.toLocaleString()}</p>
                    </div>
                </div>

                <div className="db-stat-card db-stat-success">
                    <div className="db-stat-icon-wrapper">
                        <FontAwesomeIcon icon={faDollarSign} className="db-stat-icon" />
                    </div>
                    <div className="db-stat-info">
                        <p className="db-stat-label">Doanh Thu Tháng Này</p>
                        <p className="db-stat-value">{(stats.revenue / 1000000).toFixed(1)}M </p>
                    </div>
                </div>

                <div className="db-stat-card db-stat-info">
                    <div className="db-stat-icon-wrapper">
                        <FontAwesomeIcon icon={faUserPlus} className="db-stat-icon" />
                    </div>
                    <div className="db-stat-info">
                        <p className="db-stat-label">Hội Viên Mới Tháng Này</p>
                        <p className="db-stat-value">+{stats.newMembers}</p>
                    </div>
                </div>

                <div className="db-stat-card db-stat-warning">
                    <div className="db-stat-icon-wrapper">
                        <FontAwesomeIcon icon={faCalendarCheck} className="db-stat-icon" />
                    </div>
                    <div className="db-stat-info">
                        <p className="db-stat-label">Lớp Học Sẵn Sàng</p>
                        <p className="db-stat-value">{stats.activeClasses}</p>
                    </div>
                </div>

                <div className="db-stat-card db-stat-purple">
                    <div className="db-stat-icon-wrapper">
                        <FontAwesomeIcon icon={faBoxOpen} className="db-stat-icon" />
                    </div>
                    <div className="db-stat-info">
                        <p className="db-stat-label">Sản Phẩm Trong Kho</p>
                        <p className="db-stat-value">{stats.totalProducts}</p>
                    </div>
                </div>

                <div className="db-stat-card db-stat-danger">
                    <div className="db-stat-icon-wrapper">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="db-stat-icon" />
                    </div>
                    <div className="db-stat-info">
                        <p className="db-stat-label">Đơn Hàng Chờ Xử Lý</p>
                        <p className="db-stat-value">{stats.pendingOrders}</p>
                    </div>
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="db-charts-grid">
                <div className="db-chart-card db-chart-large">
                    <div className="db-card-header">
                        <h3 className="db-card-title">
                            <FontAwesomeIcon icon={faDollarSign} /> Tổng Quan Doanh Thu 12 Tháng
                        </h3>
                    </div>
                    <div className="db-chart-wrapper">
                        <Bar data={revenueData} options={chartOptions} />
                    </div>
                </div>

                <div className="db-chart-card">
                    <div className="db-card-header">
                        <h3 className="db-card-title">
                            <FontAwesomeIcon icon={faUsers} /> Phân Bổ Gói Tập
                        </h3>
                    </div>
                    <div className="db-chart-wrapper">
                        <Doughnut data={packageDistribution} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: { color: '#6b7280', padding: 15 }
                                }
                            }
                        }} />
                    </div>
                </div>

                <div className="db-chart-card">
                    <div className="db-card-header">
                        <h3 className="db-card-title">
                            <FontAwesomeIcon icon={faUserPlus} /> Tăng Trưởng Hội Viên Mới
                        </h3>
                    </div>
                    <div className="db-chart-wrapper">
                        <Line data={newMembersData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Hàng thông tin chi tiết */}
            <div className="db-details-grid">
                {/* Hội viên mới */}
                <div className="db-list-card">
                    <div className="db-card-header">
                        <h3 className="db-card-title">
                            <FontAwesomeIcon icon={faUserPlus} /> Hội Viên Mới Gần Đây
                        </h3>
                    </div>
                    <div className="db-table-container">
                        <table className="db-data-table">
                            <thead>
                                <tr>
                                    <th>Tên Hội Viên</th>
                                    <th>Ngày Tham Gia</th>
                                    <th>Gói Tập</th>
                                    <th>Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentMembers.map(member => (
                                    <tr key={member.id}>
                                        <td className="db-member-name">{member.name}</td>
                                        <td>{member.joinDate}</td>
                                        <td><span className="db-plan-badge">{member.plan}</span></td>
                                        <td><span className="db-status-badge db-status-active">Hoạt động</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Lớp học sắp diễn ra */}
                <div className="db-list-card">
                    <div className="db-card-header">
                        <h3 className="db-card-title">
                            <FontAwesomeIcon icon={faCalendarCheck} /> Lớp Học Sắp Diễn Ra
                        </h3>
                    </div>
                    <div className="db-class-list">
                        {upcomingClasses.map(classItem => (
                            <div key={classItem.id} className="db-class-item">
                                <div className="db-class-time">
                                    <FontAwesomeIcon icon={faClock} />
                                    <span>{classItem.time}</span>
                                </div>
                                <div className="db-class-info">
                                    <h4 className="db-class-name">{classItem.name}</h4>
                                    <p className="db-class-trainer">{classItem.trainer}</p>
                                </div>
                                <div className="db-class-participants">
                                    <FontAwesomeIcon icon={faUsers} />
                                    <span>{classItem.participants}/{classItem.maxParticipants}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cảnh báo */}
                <div className="db-list-card db-alerts-card">
                    <div className="db-card-header">
                        <h3 className="db-card-title">
                            <FontAwesomeIcon icon={faExclamationTriangle} /> Thông Báo & Cảnh Báo
                        </h3>
                    </div>
                    <div className="db-alerts-list">
                        {alerts.map(alert => (
                            <div key={alert.id} className={`db-alert-item db-alert-${alert.type}`}>
                                <div className="db-alert-icon">
                                    <FontAwesomeIcon icon={
                                        alert.type === 'warning' ? faExclamationTriangle :
                                        alert.type === 'danger' ? faFire :
                                        faClock
                                    } />
                                </div>
                                <div className="db-alert-content">
                                    <p className="db-alert-message">{alert.message}</p>
                                    <span className="db-alert-time">{alert.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
