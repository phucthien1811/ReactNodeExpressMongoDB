import userService from '../use-cases/user.use-case.js';
import { exportToExcel, presetStyles } from '../utils/excelExporter.js';
import db from '../config/knex.js';
import moment from 'moment';

class UserController {
  // GET /api/v1/users - Lấy danh sách users
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;

      const result = await userService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get users'
      });
    }
  }

  // GET /api/v1/users/stats - Lấy thống kê
  async getStats(req, res) {
    try {
      const stats = await userService.getUserStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get stats'
      });
    }
  }

  // GET /api/v1/users/:id - Lấy chi tiết user
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(error.message === 'User not found' ? 404 : 500).json({
        success: false,
        message: error.message || 'Failed to get user'
      });
    }
  }

  // GET /api/v1/users/:id/detail - Lấy chi tiết đầy đủ member (profile + packages)
  async getMemberDetail(req, res) {
    try {
      const { id } = req.params;

      // Get user basic info
      const user = await db('users')
        .where('id', id)
        .first();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Get member profile
      const profile = await db('member_profiles')
        .where('user_id', id)
        .first();

      // Get active packages
      const packages = await db('member_packages')
        .leftJoin('packages', 'member_packages.package_id', 'packages.id')
        .where('member_packages.user_id', id)
        .select(
          'member_packages.*',
          'packages.name as package_name',
          'packages.duration_days',
          'packages.price'
        )
        .orderBy('member_packages.created_at', 'desc');

      // Calculate remaining days for each package
      const packagesWithDays = packages.map(pkg => {
        const now = moment();
        const endDate = moment(pkg.end_date);
        const remainingDays = endDate.diff(now, 'days');
        const isExpired = remainingDays < 0;

        return {
          ...pkg,
          remaining_days: isExpired ? 0 : remainingDays,
          is_expired: isExpired,
          status_label: pkg.status === 'active' ? 'Đang hoạt động' : 
                       pkg.status === 'expired' ? 'Đã hết hạn' : 
                       pkg.status === 'cancelled' ? 'Đã hủy' : pkg.status
        };
      });

      // Get orders (đơn hàng đã mua)
      const orders = await db('orders')
        .where('user_id', id)
        .select(
          'id',
          'order_number',
          'status',
          'total_amount',
          'payment_status',
          'payment_method',
          'created_at'
        )
        .orderBy('created_at', 'desc')
        .limit(10); // Lấy 10 đơn gần nhất

      // Get payment transactions (lịch sử giao dịch) với thông tin order chi tiết
      const transactions = await db('payment_transactions')
        .leftJoin('orders', 'payment_transactions.order_id', 'orders.id')
        .leftJoin('packages', 'payment_transactions.package_id', 'packages.id')
        .where('payment_transactions.user_id', id)
        .select(
          'payment_transactions.*',
          'orders.total_amount as order_amount',
          'orders.order_number',
          'packages.name as package_name'
        )
        .orderBy('payment_transactions.created_at', 'desc')
        .limit(10); // Lấy 10 giao dịch gần nhất

      // Format transactions
      const formattedTransactions = transactions.map(trx => ({
        ...trx,
        bank_code_display: trx.bank_code === 'MOCK_BANK' ? 'Chuyển khoản' : (trx.bank_code || '-'),
        type_display: trx.type === 'package' ? 'Mua gói tập' : 
                     trx.type === 'order' ? 'Mua sản phẩm' : trx.type,
        status_display: trx.status === 'success' ? 'Thành công' : 
                       trx.status === 'pending' ? 'Đang xử lý' : 
                       trx.status === 'failed' ? 'Thất bại' : trx.status
      }));

      // Remove password from user object
      delete user.password;

      res.json({
        success: true,
        data: {
          user,
          profile,
          packages: packagesWithDays,
          orders,
          transactions: formattedTransactions
        }
      });
    } catch (error) {
      console.error('Get member detail error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy thông tin chi tiết'
      });
    }
  }

  // GET /api/v1/users/:id/transactions/export - Export giao dịch của user ra Excel
  async exportUserTransactions(req, res) {
    try {
      const { id } = req.params;

      // Get user info
      const user = await db('users')
        .where('id', id)
        .select('id', 'name', 'email')
        .first();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Get all transactions (không limit)
      const transactions = await db('payment_transactions')
        .leftJoin('orders', 'payment_transactions.order_id', 'orders.id')
        .leftJoin('packages', 'payment_transactions.package_id', 'packages.id')
        .where('payment_transactions.user_id', id)
        .select(
          'payment_transactions.*',
          'orders.order_number',
          'packages.name as package_name'
        )
        .orderBy('payment_transactions.created_at', 'desc');

      if (transactions.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không có giao dịch nào để xuất'
        });
      }

      // Format data cho Excel
      const excelData = transactions.map((trx, index) => ({
        stt: index + 1,
        ma_gd: trx.id,
        txn_ref: trx.txn_ref,
        ngay_gio: new Date(trx.created_at).toLocaleString('vi-VN'),
        loai: trx.type === 'package' ? 'Mua gói tập' : 'Mua sản phẩm',
        chi_tiet: trx.type === 'package' ? (trx.package_name || '-') : (trx.order_number || '-'),
        so_tien: parseFloat(trx.amount),
        phuong_thuc: trx.bank_code === 'MOCK_BANK' ? 'Chuyển khoản' : (trx.bank_code || '-'),
        trang_thai: trx.status === 'success' ? 'Thành công' : 
                    trx.status === 'pending' ? 'Đang xử lý' : 
                    trx.status === 'failed' ? 'Thất bại' : trx.status
      }));

      const headers = [
        { type: 'title', value: `LỊCH SỬ GIAO DỊCH - ${user.name.toUpperCase()}` },
        { type: 'info', value: `Email: ${user.email}` },
        { type: 'info', value: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}` },
        { type: 'info', value: `Tổng số giao dịch: ${transactions.length}` },
        { type: 'empty' }
      ];

      const config = {
        fileName: `transactions_user_${user.id}_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Lịch sử giao dịch',
        headers,
        columns: [
          { header: 'STT', key: 'stt', width: 8 },
          { header: 'Mã GD', key: 'ma_gd', width: 10 },
          { header: 'Mã tham chiếu', key: 'txn_ref', width: 25 },
          { header: 'Ngày giờ', key: 'ngay_gio', width: 20 },
          { header: 'Loại', key: 'loai', width: 18 },
          { header: 'Chi tiết', key: 'chi_tiet', width: 30 },
          { header: 'Số tiền (đ)', key: 'so_tien', width: 18 },
          { header: 'Phương thức', key: 'phuong_thuc', width: 20 },
          { header: 'Trạng thái', key: 'trang_thai', width: 15 }
        ],
        data: excelData,
        styles: presetStyles.green
      };

      const buffer = await exportToExcel(config);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(config.fileName)}"`);
      res.send(buffer);

    } catch (error) {
      console.error('Export user transactions error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xuất giao dịch'
      });
    }
  }

  // POST /api/v1/users - Tạo user mới (Admin only)
  async createUser(req, res) {
    try {
      const { email, password, name, role, phone } = req.body;

      const newUser = await userService.createUser({
        email,
        password,
        name,
        role,
        phone
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create user'
      });
    }
  }

  // PUT /api/v1/users/:id - Cập nhật user (Admin only)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { email, password, name, role, phone } = req.body;

      const updatedUser = await userService.updateUser(id, {
        email,
        password,
        name,
        role,
        phone
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(error.message === 'User not found' ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to update user'
      });
    }
  }

  // DELETE /api/v1/users/:id - Xóa user (Admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(error.message === 'User not found' ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to delete user'
      });
    }
  }

  // PATCH /api/v1/users/:id/toggle-status - Toggle trạng thái active (Admin only)
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const updatedUser = await userService.toggleUserStatus(id);

      res.json({
        success: true,
        message: `User ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`,
        data: updatedUser
      });
    } catch (error) {
      console.error('Toggle status error:', error);
      res.status(error.message === 'User not found' ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to toggle user status'
      });
    }
  }

  // Export users to Excel
  async exportUsers(req, res) {
    try {
      console.log('📊 Export users called');
      console.log('Query params:', req.query);
      
      const { search = '', status = '' } = req.query;

      // Lấy tất cả users (không phân trang)
      const result = await userService.getAllUsers({
        page: 1,
        limit: 10000,
        search,
        status
      });

      const users = result.data || [];

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không có dữ liệu để xuất'
        });
      }

      // Helper functions
      const getRoleName = (role) => {
        const roleMap = {
          'admin': 'Quản trị viên',
          'trainer': 'Huấn luyện viên',
          'member': 'Hội viên'
        };
        return roleMap[role] || role;
      };

      // Chuẩn bị data cho Excel
      const excelData = users.map((user, index) => ({
        stt: index + 1,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        role: getRoleName(user.role),
        status: user.is_active ? 'Hoạt động' : 'Không hoạt động'
      }));

      // Tạo filter summary
      const filterSummary = [];
      if (search) filterSummary.push(`Tìm kiếm: "${search}"`);
      if (status) filterSummary.push(`Trạng thái: ${status === 'active' ? 'Hoạt động' : 'Không hoạt động'}`);

      const headers = [
        { type: 'title', value: 'DANH SÁCH NGƯỜI DÙNG' },
        { type: 'info', value: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}` },
        { type: 'info', value: `Tổng số người dùng: ${users.length}` }
      ];

      if (filterSummary.length > 0) {
        headers.push({ type: 'info', value: `Bộ lọc: ${filterSummary.join(', ')}` });
      }

      headers.push({ type: 'empty' });

      // Cấu hình xuất Excel
      const config = {
        fileName: `users_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Danh sách người dùng',
        headers,
        columns: [
          { header: 'STT', key: 'stt', width: 8 },
          { header: 'Họ và Tên', key: 'name', width: 30 },
          { header: 'Email', key: 'email', width: 35 },
          { header: 'Số Điện Thoại', key: 'phone', width: 18 },
          { header: 'Vai Trò', key: 'role', width: 20 },
          { header: 'Trạng Thái', key: 'status', width: 18 }
        ],
        data: excelData,
        styles: presetStyles.blue // Sử dụng theme xanh dương cho users
      };

      // Tạo file Excel
      const buffer = await exportToExcel(config);

      // Gửi file về client
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(config.fileName)}"`);
      res.send(buffer);

    } catch (error) {
      console.error('Export users error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export users'
      });
    }
  }
}

export default new UserController();
