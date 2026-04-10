import voucherRepo from '../repositories/voucher.repo.js';

const voucherService = {
  // Tạo voucher mới
  async createVoucher(voucherData, adminId) {
    // Tạo mã voucher ngẫu nhiên 9 ký tự nếu không có
    if (!voucherData.code) {
      voucherData.code = this.generateVoucherCode();
    } else {
      // Chuẩn hóa mã voucher: in hoa, loại bỏ khoảng trắng
      voucherData.code = voucherData.code.toUpperCase().trim();
    }

    // Kiểm tra mã đã tồn tại chưa
    const existing = await voucherRepo.findByCode(voucherData.code);
    if (existing) {
      throw new Error('Mã voucher đã tồn tại');
    }

    // Chuyển max_discount = 0 hoặc rỗng thành null (không giới hạn)
    if (!voucherData.max_discount || voucherData.max_discount == 0) {
      voucherData.max_discount = null;
    }

    // Validate dữ liệu
    this.validateVoucherData(voucherData);

    voucherData.created_by = adminId;
    return voucherRepo.create(voucherData);
  },

  // Tạo mã voucher ngẫu nhiên
  generateVoucherCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 9; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  // Validate dữ liệu voucher
  validateVoucherData(data) {
    if (!data.code || data.code.length !== 9) {
      throw new Error('Mã voucher phải có đúng 9 ký tự');
    }

    if (!data.name || data.name.trim() === '') {
      throw new Error('Tên voucher không được để trống');
    }

    if (!['percentage', 'fixed'].includes(data.discount_type)) {
      throw new Error('Loại giảm giá không hợp lệ');
    }

    if (!data.discount_value || data.discount_value <= 0) {
      throw new Error('Giá trị giảm giá phải lớn hơn 0');
    }

    if (data.discount_type === 'percentage' && data.discount_value > 100) {
      throw new Error('Giá trị giảm giá phần trăm không được vượt quá 100%');
    }

    if (!data.valid_from || !data.valid_until) {
      throw new Error('Ngày hiệu lực không được để trống');
    }

    const validFrom = new Date(data.valid_from);
    const validUntil = new Date(data.valid_until);

    if (validUntil <= validFrom) {
      throw new Error('Ngày hết hạn phải sau ngày bắt đầu');
    }
  },

  // Lấy danh sách vouchers
  async getVouchers(filters) {
    return voucherRepo.findAll(filters);
  },

  // Lấy chi tiết voucher
  async getVoucherById(id) {
    const voucher = await voucherRepo.findById(id);
    if (!voucher) {
      throw new Error('Không tìm thấy voucher');
    }
    return voucher;
  },

  // Cập nhật voucher
  async updateVoucher(id, voucherData) {
    const voucher = await voucherRepo.findById(id);
    if (!voucher) {
      throw new Error('Không tìm thấy voucher');
    }

    // Không cho phép thay đổi mã voucher
    delete voucherData.code;
    delete voucherData.created_by;
    delete voucherData.used_count;

    // Chuyển max_discount = 0 hoặc rỗng thành null (không giới hạn)
    if (!voucherData.max_discount || voucherData.max_discount == 0) {
      voucherData.max_discount = null;
    }

    this.validateVoucherData({ ...voucher, ...voucherData });

    return voucherRepo.update(id, voucherData);
  },

  // Xóa voucher
  async deleteVoucher(id) {
    const voucher = await voucherRepo.findById(id);
    if (!voucher) {
      throw new Error('Không tìm thấy voucher');
    }

    // Chỉ cho phép xóa voucher chưa được sử dụng
    if (voucher.used_count > 0) {
      throw new Error('Không thể xóa voucher đã được sử dụng');
    }

    return voucherRepo.delete(id);
  },

  // Vô hiệu hóa voucher
  async deactivateVoucher(id) {
    return voucherRepo.update(id, { is_active: false });
  },

  // Kích hoạt voucher
  async activateVoucher(id) {
    return voucherRepo.update(id, { is_active: true });
  },

  // Áp dụng voucher
  async applyVoucher(code, orderValue) {
    const validation = await voucherRepo.isValid(code, orderValue);
    
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const voucher = validation.voucher;
    const discount = voucherRepo.calculateDiscount(voucher, orderValue);

    return {
      voucher_id: voucher.id,
      voucher_code: voucher.code,
      discount_amount: discount,
      final_amount: Math.max(0, orderValue - discount)
    };
  },

  // Sử dụng voucher (tăng used_count)
  async useVoucher(voucherId) {
    return voucherRepo.incrementUsedCount(voucherId);
  }
};

export default voucherService;
