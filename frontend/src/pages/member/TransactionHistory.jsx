import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faCalendarAlt, faSpinner, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../context/ToastContext';
import './css/TransactionHistory.css';

const TransactionHistory = () => {
    const { showSuccess, showError } = useToast();
    const [activeFilter, setActiveFilter] = useState('all');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    // Fetch transactions from API
    useEffect(() => {
        fetchTransactions();
    }, [pagination.page, activeFilter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit
            });

            // Add filters
            if (activeFilter !== 'all') {
                params.append('type', activeFilter);
            }
            if (filters.status) {
                params.append('status', filters.status);
            }
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }

            const response = await fetch(`http://localhost:4000/api/v1/payment/transactions?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setTransactions(data.data.transactions);
                setPagination(data.data.pagination);
            } else {
                console.error('Error fetching transactions:', data.message);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType) => {
        setActiveFilter(filterType);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleExportExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();

            // Add filters
            if (activeFilter !== 'all') {
                params.append('type', activeFilter);
            }
            if (filters.status) {
                params.append('status', filters.status);
            }
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }

            const response = await fetch(`http://localhost:4000/api/v1/payment/transactions/export?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Download file
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Lich_su_giao_dich_${new Date().getTime()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                showSuccess('Xuất file Excel thành công!');
            } else {
                console.error('Error exporting Excel');
                showError('Có lỗi xảy ra khi xuất file Excel');
            }
        } catch (error) {
            console.error('Error exporting Excel:', error);
            showError('Có lỗi xảy ra khi xuất file Excel');
        }
    };

    const filterOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'package', label: 'Gói tập' },
        { value: 'order', label: 'Mua hàng' }
    ];
    
    // Hàm để lấy class màu cho status
    const getStatusClass = (status) => {
        switch (status) {
            case 'success': return 'status-success';
            case 'failed': return 'status-danger';
            case 'pending': return 'status-warning';
            default: return '';
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="transactions-page-container fade-in">
            <div className="page-header">
                <h1 className="page-title">Lịch Sử Giao Dịch</h1>
                <button className="btn-export-excel" onClick={handleExportExcel}>
                    <FontAwesomeIcon icon={faFileExcel} />
                    Xuất Excel
                </button>
            </div>

            {/* Thanh công cụ: Filter */}
            <div className="toolbar">
                <div className="filters-container">
                    <FontAwesomeIcon icon={faFilter} />
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            className={`filter-chip ${activeFilter === option.value ? 'active' : ''}`}
                            onClick={() => handleFilterChange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <div className="date-range-picker">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <input 
                        type="date" 
                        value={filters.startDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    <span>-</span>
                    <input 
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                    <button className="btn-secondary" onClick={fetchTransactions}>Lọc</button>
                </div>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="loading-container">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                    <p>Đang tải lịch sử giao dịch...</p>
                </div>
            ) : (
                <>
                    {/* Bảng giao dịch */}
                    <div className="table-container">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Mã GD</th>
                                    <th>Ngày</th>
                                    <th>Loại</th>
                                    <th>Chi tiết</th>
                                    <th>Số tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Ngân hàng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? (
                                    transactions.map(trx => (
                                        <tr key={trx.id}>
                                            <td><span className="trx-id">{trx.txnRef}</span></td>
                                            <td>{formatDate(trx.createdAt)}</td>
                                            <td>{trx.typeLabel}</td>
                                            <td>{trx.description || 'N/A'}</td>
                                            <td className="amount positive">
                                                {trx.amount.toLocaleString('vi-VN')}đ
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(trx.status)}`}>
                                                    {trx.statusLabel}
                                                </span>
                                            </td>
                                            <td>{trx.bankCode || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-data-cell">
                                            Không có giao dịch nào{activeFilter !== 'all' ? ' phù hợp' : ''}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                ← Trước
                            </button>
                            <span>Trang {pagination.page} / {pagination.totalPages}</span>
                            <button 
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TransactionHistory;
