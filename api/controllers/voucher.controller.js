import voucherService from '../services/voucher.service.js';

const voucherController = {
  // Tạo voucher mới (Admin only)
  async createVoucher(req, res) {
    try {
      const voucher = await voucherService.createVoucher(req.body, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Tạo voucher thành công',
        data: voucher
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Lấy danh sách vouchers (Admin only)
  async getVouchers(req, res) {
    try {
      const filters = {
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
        search: req.query.search
      };
      
      const vouchers = await voucherService.getVouchers(filters);
      res.json({
        success: true,
        data: vouchers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Lấy chi tiết voucher (Admin only)
  async getVoucherById(req, res) {
    try {
      const voucher = await voucherService.getVoucherById(req.params.id);
      res.json({
        success: true,
        data: voucher
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  // Cập nhật voucher (Admin only)
  async updateVoucher(req, res) {
    try {
      const voucher = await voucherService.updateVoucher(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Cập nhật voucher thành công',
        data: voucher
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Xóa voucher (Admin only)
  async deleteVoucher(req, res) {
    try {
      await voucherService.deleteVoucher(req.params.id);
      res.json({
        success: true,
        message: 'Xóa voucher thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Kích hoạt/vô hiệu hóa voucher (Admin only)
  async toggleVoucherStatus(req, res) {
    try {
      const { is_active } = req.body;
      const voucher = is_active 
        ? await voucherService.activateVoucher(req.params.id)
        : await voucherService.deactivateVoucher(req.params.id);
      
      res.json({
        success: true,
        message: is_active ? 'Kích hoạt voucher thành công' : 'Vô hiệu hóa voucher thành công',
        data: voucher
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Kiểm tra và áp dụng voucher (Public - cho checkout)
  async applyVoucher(req, res) {
    try {
      const { code, order_value } = req.body;
      
      if (!code || !order_value) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu mã voucher hoặc giá trị đơn hàng'
        });
      }

      const result = await voucherService.applyVoucher(code, order_value);
      res.json({
        success: true,
        message: 'Áp dụng voucher thành công',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Sử dụng voucher - tăng used_count (khi hoàn tất đơn hàng)
  async useVoucher(req, res) {
    try {
      await voucherService.useVoucher(req.params.id);
      res.json({
        success: true,
        message: 'Sử dụng voucher thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default voucherController;
