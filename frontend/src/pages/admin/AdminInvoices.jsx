import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faSearch, 
    faFilePdf, 
    faExclamationTriangle, 
    faCheck,
    faTimes,
    faEye,
    faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../context/ToastContext';
import './css/AdminInvoices.css';

const API_URL = 'http://localhost:3000/api/v1';

// Mock data cho sản phẩm/dịch vụ thường dùng
const commonItems = [
    { name: "Nước suối", price: 10000 },
    { name: "Nước tăng lực", price: 25000 },
    { name: "Khăn tập", price: 50000 },
    { name: "Protein shake", price: 80000 },
    { name: "Gói tập 1 buổi", price: 100000 },
    { name: "Thuê tủ đồ", price: 20000 }
];

export default function AdminInvoices() {
    const { showToast } = useToast();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [searchTerm, setSearchTerm] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        selectedMember: null,
        itemName: '',
        quantity: 1,
        unitPrice: 0,
        totalAmount: 0,
        amountPaid: 0,
        changeAmount: 0,
        paymentMethod: 'cash',
        issueDate: new Date().toISOString().split('T')[0],
        description: ''
    });

    // Fetch invoices from API
    useEffect(() => {
        fetchInvoices();
        fetchUsers();
        
        // Click outside to close dropdown
        const handleClickOutside = (e) => {
            if (!e.target.closest('.ai-export-excel-dropdown')) {
                setShowExportDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/invoices`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setInvoices(data.data.invoices || []);
            }
        } catch (error) {
            console.error('Lỗi khi tải hóa đơn:', error);
            showToast('Không thể tải danh sách hóa đơn', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách người dùng:', error);
        }
    };

    // Filter invoices based on search term
    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

    // Reset to page 1 when search term changes
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleExportExcel = (type = 'all') => {
        try {
            const token = localStorage.getItem('token');
            
            // Tạo query params từ các filter hiện tại
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            
            // Thêm filter theo type
            if (type === 'today') {
                const today = new Date().toISOString().split('T')[0];
                params.append('startDate', today);
                params.append('endDate', today);
            }
            
            // Tạo URL với query params
            const url = `${API_URL}/invoices/export-excel?${params.toString()}`;
            
            // Đóng dropdown
            setShowExportDropdown(false);
            
            // Tải file bằng fetch
            fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Không thể xuất file Excel');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const fileName = type === 'today' 
                    ? `Hoa-Don-Hom-Nay-${new Date().toISOString().split('T')[0]}.xlsx`
                    : `Hoa-Don-Tat-Ca-${new Date().toISOString().split('T')[0]}.xlsx`;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                showToast(type === 'today' ? 'Xuất hóa đơn hôm nay thành công!' : 'Xuất tất cả hóa đơn thành công!', 'success');
            })
            .catch(error => {
                console.error('Export error:', error);
                showToast('Lỗi xuất file Excel: ' + error.message, 'error');
            });
        } catch (error) {
            console.error('Export error:', error);
            showToast('Lỗi xuất file Excel', 'error');
        }
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'ai-status-paid';
            case 'pending': 
            case 'unpaid': return 'ai-status-unpaid';
            default: return '';
        }
    };

    const handleExportPDF = (invoice) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!invoice || !invoice.id) {
                showToast('Không thể xuất PDF: Thông tin hóa đơn không hợp lệ', 'error');
                return;
            }
            
            // Tạo URL để tải PDF
            const url = `${API_URL}/invoices/${invoice.id}/export-pdf`;
            
            // Tải file bằng fetch
            fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Không thể xuất file PDF');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Hoa-Don-${invoice.invoice_number}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                showToast('Xuất file PDF thành công!', 'success');
            })
            .catch(error => {
                console.error('Export PDF error:', error);
                showToast('Lỗi xuất file PDF: ' + error.message, 'error');
            });
        } catch (error) {
            console.error('Export PDF error:', error);
            showToast('Có lỗi xảy ra khi xuất PDF', 'error');
        }
    };

    const handleWarning = (invoice) => {
        showToast(`Đã gửi cảnh báo cho hội viên: ${invoice.customer_name}`, 'info');
        // Logic gửi cảnh báo
    };

    const handleConfirmPayment = async (invoice) => {
        if (invoice.payment_status === 'paid') {
            showToast('Hóa đơn đã được thanh toán rồi!', 'warning');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/invoices/${invoice.id}/confirm-payment`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount_paid: parseFloat(invoice.total_amount),
                    change_amount: 0
                })
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Xác nhận thanh toán thành công!', 'success');
                fetchInvoices(); // Reload invoices
            } else {
                showToast(data.message || 'Không thể xác nhận thanh toán', 'error');
            }
        } catch (error) {
            console.error('Lỗi khi xác nhận thanh toán:', error);
            showToast('Có lỗi xảy ra khi xác nhận thanh toán', 'error');
        }
    };

    const handleViewInvoice = (invoice) => {
        setViewingInvoice(invoice);
        setShowViewModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInvoice(prev => {
            const updated = {
                ...prev,
                [name]: name === 'quantity' || name === 'unitPrice' || name === 'amountPaid' 
                    ? parseFloat(value) || 0 
                    : value
            };
            
            // Auto calculate total amount
            if (name === 'quantity' || name === 'unitPrice') {
                updated.totalAmount = updated.quantity * updated.unitPrice;
                updated.changeAmount = Math.max(0, updated.amountPaid - updated.totalAmount);
            }
            
            // Auto calculate change
            if (name === 'amountPaid') {
                updated.changeAmount = Math.max(0, updated.amountPaid - updated.totalAmount);
            }
            
            return updated;
        });
    };

    const handleMemberSelect = (e) => {
        const selectedMember = users.find(user => user.id === parseInt(e.target.value));
        setNewInvoice(prev => ({
            ...prev,
            selectedMember: selectedMember || null
        }));
    };

    const handleCommonItemSelect = (e) => {
        const selectedItem = commonItems.find(item => item.name === e.target.value);
        if (selectedItem) {
            setNewInvoice(prev => ({
                ...prev,
                itemName: selectedItem.name,
                unitPrice: selectedItem.price,
                totalAmount: prev.quantity * selectedItem.price,
                changeAmount: Math.max(0, prev.amountPaid - (prev.quantity * selectedItem.price))
            }));
        }
    };

    const handleCreateInvoice = async () => {
        // Add validation logic here
        if (!newInvoice.selectedMember || !newInvoice.itemName || !newInvoice.unitPrice) {
            showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/invoices`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: newInvoice.selectedMember.id,
                    customer_name: newInvoice.selectedMember.name || newInvoice.selectedMember.username,
                    customer_email: newInvoice.selectedMember.email,
                    customer_phone: newInvoice.selectedMember.phone,
                    item_name: newInvoice.itemName,
                    description: newInvoice.description,
                    quantity: newInvoice.quantity,
                    unit_price: newInvoice.unitPrice,
                    total_amount: newInvoice.totalAmount,
                    payment_method: newInvoice.paymentMethod,
                    amount_paid: newInvoice.amountPaid,
                    change_amount: newInvoice.changeAmount
                })
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Tạo hóa đơn thành công!', 'success');
                fetchInvoices(); // Reload invoices
                
                // Reset form and close modal
                setNewInvoice({
                    selectedMember: null,
                    itemName: '',
                    quantity: 1,
                    unitPrice: 0,
                    totalAmount: 0,
                    amountPaid: 0,
                    changeAmount: 0,
                    paymentMethod: 'cash',
                    issueDate: new Date().toISOString().split('T')[0],
                    description: ''
                });
                setShowCreateModal(false);
            } else {
                showToast(data.message || 'Không thể tạo hóa đơn', 'error');
            }
        } catch (error) {
            console.error('Lỗi khi tạo hóa đơn:', error);
            showToast('Có lỗi xảy ra khi tạo hóa đơn', 'error');
        }
    };

    return (
        <div className="ai-admin-page-container">
            <div className="ai-admin-page-header">
                <h2 className="ai-admin-page-title">Hóa Đơn & Thanh Toán</h2>
                <div className="ai-admin-page-actions">
                    <div className="ai-search-bar">
                        <FontAwesomeIcon icon={faSearch} className="ai-search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm hóa đơn..." 
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <button className="ai-btn-primary" onClick={() => setShowCreateModal(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Tạo Hóa Đơn</span>
                    </button>
                </div>
            </div>

            <div className="ai-admin-table-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : currentInvoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Chưa có hóa đơn nào</p>
                    </div>
                ) : (
                <table className="ai-admin-table">
                    <thead>
                        <tr>
                            <th>Mã Hóa Đơn</th>
                            <th>Hội Viên</th>
                            <th>Số Tiền</th>
                            <th>Ngày Xuất</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentInvoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td><span className="ai-invoice-id">{invoice.invoice_number}</span></td>
                                <td>{invoice.customer_name}</td>
                                <td className="ai-amount">{parseFloat(invoice.total_amount).toLocaleString('vi-VN')}đ</td>
                                <td>{new Date(invoice.created_at).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <span className={`ai-status-pill ${getStatusClass(invoice.payment_status)}`}>
                                        {invoice.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </span>
                                </td>
                                <td>
                                    <div className="ai-action-buttons">
                                        <button 
                                            className="ai-action-btn ai-btn-view"
                                            onClick={() => handleViewInvoice(invoice)}
                                            title="Xem chi tiết"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button 
                                            className="ai-action-btn ai-btn-pdf"
                                            onClick={() => handleExportPDF(invoice)}
                                            title="Xuất PDF"
                                        >
                                            <FontAwesomeIcon icon={faFilePdf} />
                                        </button>
                                        <button 
                                            className="ai-action-btn ai-btn-warning"
                                            onClick={() => handleWarning(invoice)}
                                            title="Gửi cảnh báo"
                                        >
                                            <FontAwesomeIcon icon={faExclamationTriangle} />
                                        </button>
                                        <button 
                                            className={`ai-action-btn ai-btn-confirm ${invoice.payment_status === 'paid' ? 'ai-disabled' : ''}`}
                                            onClick={() => handleConfirmPayment(invoice)}
                                            title={invoice.payment_status === 'paid' ? 'Đã thanh toán' : 'Xác nhận thanh toán'}
                                            disabled={invoice.payment_status === 'paid'}
                                        >
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="ai-pagination-container">
                <div className="ai-export-excel-dropdown">
                    <button 
                        className="ai-btn-excel" 
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                    >
                        <FontAwesomeIcon icon={faFileExcel} />
                        Xuất Excel
                    </button>
                    
                    {showExportDropdown && (
                        <div className="ai-export-dropdown-menu">
                            <button 
                                className="ai-export-dropdown-item"
                                onClick={() => handleExportExcel('today')}
                            >
                                <FontAwesomeIcon icon={faFileExcel} />
                                Hóa đơn hôm nay
                            </button>
                            <button 
                                className="ai-export-dropdown-item"
                                onClick={() => handleExportExcel('all')}
                            >
                                <FontAwesomeIcon icon={faFileExcel} />
                                Tất cả hóa đơn
                            </button>
                        </div>
                    )}
                </div>

                <div className="ai-pagination-controls">
                    <button 
                        className="ai-pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        «
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            className={`ai-pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                    
                    <button 
                        className="ai-pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        »
                    </button>
                </div>
            </div>

            {/* Modal Tạo Hóa Đơn */}
            {showCreateModal && (
                <div className="ai-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="ai-modal-header">
                            <h3>Tạo Hóa Đơn Mới</h3>
                            <button 
                                className="ai-modal-close-btn"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="ai-modal-body">
                            <div className="ai-form-grid">
                                <div className="ai-form-group">
                                    <label>Chọn hội viên *</label>
                                    <select
                                        value={newInvoice.selectedMember?.id || ''}
                                        onChange={handleMemberSelect}
                                        required
                                    >
                                        <option value="">-- Chọn hội viên --</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name || user.username} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="ai-form-group">
                                    <label>Chọn sản phẩm/dịch vụ thường dùng</label>
                                    <select
                                        value=""
                                        onChange={handleCommonItemSelect}
                                    >
                                        <option value="">-- Chọn từ danh sách có sẵn --</option>
                                        {commonItems.map((item, index) => (
                                            <option key={index} value={item.name}>
                                                {item.name} - {item.price.toLocaleString('vi-VN')}đ
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="ai-form-group">
                                    <label>Tên sản phẩm/dịch vụ *</label>
                                    <input
                                        type="text"
                                        name="itemName"
                                        value={newInvoice.itemName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên sản phẩm/dịch vụ"
                                        required
                                    />
                                </div>

                                <div className="ai-form-group">
                                    <label>Số lượng *</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={newInvoice.quantity}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="ai-form-group">
                                    <label>Đơn giá *</label>
                                    <input
                                        type="number"
                                        name="unitPrice"
                                        value={newInvoice.unitPrice}
                                        onChange={handleInputChange}
                                        placeholder="Nhập đơn giá"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="ai-form-group">
                                    <label>Tổng tiền</label>
                                    <input
                                        type="text"
                                        value={`${newInvoice.totalAmount.toLocaleString('vi-VN')}đ`}
                                        disabled
                                        className="ai-calculated-field"
                                    />
                                </div>

                                <div className="ai-form-group">
                                    <label>Tiền khách đưa</label>
                                    <input
                                        type="number"
                                        name="amountPaid"
                                        value={newInvoice.amountPaid}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số tiền khách đưa"
                                        min="0"
                                    />
                                </div>

                                <div className="ai-form-group">
                                    <label>Tiền thối</label>
                                    <input
                                        type="text"
                                        value={`${newInvoice.changeAmount.toLocaleString('vi-VN')}đ`}
                                        disabled
                                        className="ai-calculated-field ai-change-amount"
                                    />
                                </div>

                                <div className="ai-form-group">
                                    <label>Phương thức thanh toán</label>
                                    <select
                                        name="paymentMethod"
                                        value={newInvoice.paymentMethod}
                                        onChange={handleInputChange}
                                    >
                                        <option value="cash">Tiền mặt</option>
                                        <option value="banking">Chuyển khoản</option>
                                        <option value="card">Thẻ tín dụng</option>
                                    </select>
                                </div>

                                <div className="ai-form-group">
                                    <label>Ngày xuất hóa đơn</label>
                                    <input
                                        type="date"
                                        name="issueDate"
                                        value={newInvoice.issueDate}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="ai-form-group">
                                    {/* Empty space for grid alignment */}
                                </div>
                            </div>

                            <div className="ai-form-group">
                                <label>Mô tả (không bắt buộc)</label>
                                <textarea
                                    name="description"
                                    value={newInvoice.description}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mô tả cho hóa đơn..."
                                    rows="3"
                                />
                            </div>

                            {newInvoice.itemName && (
                                <div className="ai-invoice-info">
                                    <h4>Chi tiết hóa đơn:</h4>
                                    <div className="ai-info-row">
                                        <span>Khách hàng:</span>
                                        <span>{newInvoice.selectedMember?.name || 'Chưa chọn'}</span>
                                    </div>
                                    <div className="ai-info-row">
                                        <span>Sản phẩm/Dịch vụ:</span>
                                        <span>{newInvoice.itemName}</span>
                                    </div>
                                    <div className="ai-info-row">
                                        <span>Số lượng:</span>
                                        <span>{newInvoice.quantity}</span>
                                    </div>
                                    <div className="ai-info-row">
                                        <span>Đơn giá:</span>
                                        <span>{newInvoice.unitPrice.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="ai-info-row">
                                        <span>Tổng tiền:</span>
                                        <span className="ai-amount-highlight">{newInvoice.totalAmount.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="ai-info-row">
                                        <span>Tiền khách đưa:</span>
                                        <span>{newInvoice.amountPaid.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="ai-info-row">
                                        <span>Tiền thối:</span>
                                        <span className="ai-change-highlight">{newInvoice.changeAmount.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="ai-info-row">
                                        <span>Phương thức:</span>
                                        <span>{newInvoice.paymentMethod === 'cash' ? 'Tiền mặt' : newInvoice.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Thẻ tín dụng'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="ai-modal-footer">
                            <button 
                                className="ai-btn-secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="ai-btn-primary"
                                onClick={handleCreateInvoice}
                            >
                                Tạo Hóa Đơn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xem Chi Tiết Hóa Đơn */}
            {showViewModal && viewingInvoice && (
                <div className="ai-modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="ai-modal-header">
                            <h3>Chi Tiết Hóa Đơn {viewingInvoice.invoice_number}</h3>
                            <button 
                                className="ai-modal-close-btn"
                                onClick={() => setShowViewModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="ai-modal-body">
                            <div className="ai-invoice-view">
                                <div className="ai-invoice-header">
                                    <h4>Thông tin khách hàng</h4>
                                    <div className="ai-customer-info">
                                        <p><strong>Tên khách hàng:</strong> {viewingInvoice.customer_name}</p>
                                        <p><strong>Email:</strong> {viewingInvoice.customer_email}</p>
                                        <p><strong>Số điện thoại:</strong> {viewingInvoice.customer_phone}</p>
                                        <p><strong>Mã hóa đơn:</strong> {viewingInvoice.invoice_number}</p>
                                        <p><strong>Ngày xuất:</strong> {new Date(viewingInvoice.created_at).toLocaleDateString('vi-VN')}</p>
                                        <p><strong>Trạng thái:</strong> 
                                            <span className={`ai-status-pill ${getStatusClass(viewingInvoice.payment_status)}`}>
                                                {viewingInvoice.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="ai-invoice-items">
                                    <h4>Chi tiết sản phẩm/dịch vụ</h4>
                                    <div className="ai-item-details">
                                        <div className="ai-item-row">
                                            <span>Tên sản phẩm/dịch vụ:</span>
                                            <span>{viewingInvoice.item_name}</span>
                                        </div>
                                        <div className="ai-item-row">
                                            <span>Số lượng:</span>
                                            <span>{viewingInvoice.quantity}</span>
                                        </div>
                                        <div className="ai-item-row">
                                            <span>Đơn giá:</span>
                                            <span>{parseFloat(viewingInvoice.unit_price).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        {viewingInvoice.voucher_code && (
                                            <div className="ai-item-row" style={{ color: '#22c55e', fontWeight: '500' }}>
                                                <span>🎟️ Voucher giảm giá:</span>
                                                <span>-{parseFloat(viewingInvoice.discount_amount || 0).toLocaleString('vi-VN')}đ ({viewingInvoice.voucher_code})</span>
                                            </div>
                                        )}
                                        <div className="ai-item-row ai-total-row">
                                            <span>Tổng tiền:</span>
                                            <span className="ai-amount-highlight">{parseFloat(viewingInvoice.total_amount).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="ai-payment-info">
                                    <h4>Thông tin thanh toán</h4>
                                    <div className="ai-payment-details">
                                        <div className="ai-payment-row">
                                            <span>Phương thức thanh toán:</span>
                                            <span>
                                                {viewingInvoice.payment_method === 'cash' ? 'Tiền mặt' : 
                                                 viewingInvoice.payment_method === 'banking' ? 'Chuyển khoản' : 
                                                 viewingInvoice.payment_method === 'card' ? 'Thẻ tín dụng' :
                                                 viewingInvoice.payment_method === 'momo' ? 'MoMo' :
                                                 viewingInvoice.payment_method === 'vnpay' ? 'VNPay' :
                                                 viewingInvoice.payment_method === 'cod' ? 'COD' :
                                                 'Khác'}
                                            </span>
                                        </div>
                                        <div className="ai-payment-row">
                                            <span>Tiền khách đưa:</span>
                                            <span>{parseFloat(viewingInvoice.amount_paid).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="ai-payment-row">
                                            <span>Tiền thối:</span>
                                            <span className="ai-change-highlight">{parseFloat(viewingInvoice.change_amount).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        {viewingInvoice.paid_at && (
                                            <div className="ai-payment-row">
                                                <span>Ngày thanh toán:</span>
                                                <span>{new Date(viewingInvoice.paid_at).toLocaleString('vi-VN')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {viewingInvoice.description && (
                                    <div className="ai-description-info">
                                        <h4>Mô tả</h4>
                                        <p>{viewingInvoice.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="ai-modal-footer">
                            <button 
                                className="ai-btn-secondary"
                                onClick={() => setShowViewModal(false)}
                            >
                                Đóng
                            </button>
                            <button 
                                className="ai-btn-primary"
                                onClick={() => handleExportPDF(viewingInvoice)}
                            >
                                <FontAwesomeIcon icon={faFilePdf} />
                                Xuất PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
