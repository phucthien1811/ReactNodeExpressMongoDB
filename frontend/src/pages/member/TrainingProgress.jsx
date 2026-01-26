import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faCalculator, faWeightScale, faRulerVertical, faBirthdayCake, faChartLine, faEdit } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../context/ToastContext';
import './css/TrainingProgress.css'; // Import file CSS mới

const TrainingProgress = () => {
    const { showSuccess, showError } = useToast();
    // State để lưu trữ dữ liệu người dùng (sau này sẽ lấy từ API)
    const [userData, setUserData] = useState({
        height: 175, // cm
        weight: 68,  // kg
        age: 25,
        targetWeight: 65, // kg
        sessionsCompleted: 12,
        sessionsTarget: 20,
        measurements: {
            waist: 80, // Vòng eo
            chest: 95, // Vòng ngực
            thighs: 55, // Vòng đùi
        }
    });

    // State để lưu các giá trị được tính toán
    const [bmi, setBmi] = useState({ value: 0, category: '', color: '' });
    const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, carbs: 0 });

    // Sử dụng useEffect để tự động tính toán lại khi dữ liệu thay đổi
    useEffect(() => {
        // --- Tính toán BMI ---
        if (userData.height > 0 && userData.weight > 0) {
            const heightInMeters = userData.height / 100;
            const bmiValue = (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
            let category = '';
            let color = '';
            if (bmiValue < 18.5) {
                category = 'Thiếu cân';
                color = 'blue';
            } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
                category = 'Bình thường';
                color = 'green';
            } else if (bmiValue >= 25 && bmiValue <= 29.9) {
                category = 'Thừa cân';
                color = 'orange';
            } else {
                category = 'Béo phì';
                color = 'red';
            }
            setBmi({ value: bmiValue, category, color });
        }

        // --- Tính toán Dinh dưỡng (công thức tham khảo) ---
        if (userData.targetWeight > 0) {
            const calories = Math.round(userData.targetWeight * 30); // ~ calo để duy trì cân nặng mục tiêu
            const protein = Math.round(userData.targetWeight * 1.8); // ~1.8g protein mỗi kg
            const carbs = Math.round(userData.targetWeight * 3);   // ~3g carb mỗi kg
            setNutrition({ calories, protein, carbs });
        }

    }, [userData.height, userData.weight, userData.targetWeight]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    return (
        <div className="progress-page-container fade-in">
            <h1 className="page-title">Nhật ký & Tiến trình</h1>

            <div className="progress-grid">
                {/* Cột 1: Chỉ số & Mục tiêu */}
                <div className="dashboard-card">
                    <h3><FontAwesomeIcon icon={faBullseye} /> Chỉ số & Mục tiêu</h3>
                    <div className="input-grid">
                        {/* Chỉ số hiện tại */}
                        <div className="stat-display"><span><FontAwesomeIcon icon={faRulerVertical} /> Chiều cao</span><strong>{userData.height} cm</strong></div>
                        <div className="stat-display"><span><FontAwesomeIcon icon={faWeightScale} /> Cân nặng</span><strong>{userData.weight} kg</strong></div>
                        <div className="stat-display"><span><FontAwesomeIcon icon={faBirthdayCake} /> Tuổi</span><strong>{userData.age}</strong></div>
                    </div>
                    {/* Mục tiêu */}
                    <div className="input-group">
                        <label htmlFor="targetWeight">Cân nặng mục tiêu (kg)</label>
                        <input
                            type="number"
                            id="targetWeight"
                            name="targetWeight"
                            className="progress-input"
                            value={userData.targetWeight}
                            onChange={handleInputChange}
                        />
                    </div>
                    <button className="btn-primary full-width">Lưu thay đổi</button>
                </div>

                {/* Cột 2: Kết quả & Khuyến nghị */}
                <div className="dashboard-card">
                    <h3><FontAwesomeIcon icon={faCalculator} /> Kết quả & Khuyến nghị</h3>
                    {/* BMI */}
                    <div className="bmi-result-card">
                        <div className="bmi-info">
                            <span className="bmi-label">Chỉ số BMI của bạn</span>
                            <p className={`bmi-value bmi-${bmi.color}`}>{bmi.value}</p>
                        </div>
                        <div className={`bmi-category bmi-cat-${bmi.color}`}>
                            {bmi.category}
                        </div>
                    </div>
                    {/* Dinh dưỡng */}
                    <h4 className="nutrition-title">Dinh dưỡng khuyến nghị hàng ngày</h4>
                    <table className="nutrition-table">
                        <tbody>
                            <tr>
                                <td>Năng lượng (Calories)</td>
                                <td>{nutrition.calories.toLocaleString()} kcal</td>
                            </tr>
                            <tr>
                                <td>Chất đạm (Protein)</td>
                                <td>{nutrition.protein} g</td>
                            </tr>
                            <tr>
                                <td>Carbohydrate</td>
                                <td>{nutrition.carbs} g</td>
                            </tr>
                        </tbody>
                    </table>
                    <small className="nutrition-note">*Dựa trên cân nặng mục tiêu của bạn.</small>
                </div>

                {/* Cột 3: Theo dõi */}
                <div className="dashboard-card full-span">
                     <h3><FontAwesomeIcon icon={faChartLine} /> Thống kê & Theo dõi</h3>
                     <div className="tracking-grid">
                        {/* Số buổi tập */}
                        <div className="tracking-item">
                            <h4>Số buổi tập tháng này</h4>
                            <div className="session-progress">
                                <span className="session-count">{userData.sessionsCompleted} / {userData.sessionsTarget}</span>
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{width: `${(userData.sessionsCompleted / userData.sessionsTarget) * 100}%`}}></div>
                                </div>
                            </div>
                        </div>
                        {/* Số đo cơ thể */}
                        <div className="tracking-item">
                            <h4>Số đo cơ thể (cm)</h4>
                            <div className="measurements-list">
                                <span>Vòng eo: <strong>{userData.measurements.waist}</strong></span>
                                <span>Vòng ngực: <strong>{userData.measurements.chest}</strong></span>
                                <span>Vòng đùi: <strong>{userData.measurements.thighs}</strong></span>
                            </div>
                            <button className="btn-secondary"><FontAwesomeIcon icon={faEdit} /> Cập nhật số đo</button>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingProgress;
