import db from '../config/knex.js';

const voucherRepo = {
  // Tạo voucher mới
  async create(voucherData) {
    const [id] = await db('vouchers').insert(voucherData);
    return this.findById(id);
  },

  // Tìm voucher theo ID
  async findById(id) {
    return db('vouchers')
      .where({ id })
      .first();
  },

  // Tìm voucher theo code
  async findByCode(code) {
    return db('vouchers')
      .where({ code: code.toUpperCase() })
      .first();
  },

  // Lấy tất cả vouchers
  async findAll(filters = {}) {
    let query = db('vouchers')
      .select('vouchers.*', 'users.name as creator_name')
      .leftJoin('users', 'vouchers.created_by', 'users.id')
      .orderBy('vouchers.created_at', 'desc');

    if (filters.is_active !== undefined) {
      query = query.where('vouchers.is_active', filters.is_active);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('vouchers.code', 'like', `%${filters.search}%`)
          .orWhere('vouchers.name', 'like', `%${filters.search}%`);
      });
    }

    return query;
  },

  // Cập nhật voucher
  async update(id, voucherData) {
    await db('vouchers')
      .where({ id })
      .update(voucherData);
    return this.findById(id);
  },

  // Xóa voucher
  async delete(id) {
    return db('vouchers')
      .where({ id })
      .delete();
  },

  // Tăng số lần sử dụng
  async incrementUsedCount(id) {
    return db('vouchers')
      .where({ id })
      .increment('used_count', 1);
  },

  // Kiểm tra voucher còn hiệu lực
  async isValid(code, orderValue) {
    const voucher = await this.findByCode(code);
    
    if (!voucher) {
      return { valid: false, message: 'Mã voucher không tồn tại' };
    }

    if (!voucher.is_active) {
      return { valid: false, message: 'Mã voucher đã bị vô hiệu hóa' };
    }

    const now = new Date();
    const validFrom = new Date(voucher.valid_from);
    const validUntil = new Date(voucher.valid_until);

    if (now < validFrom) {
      return { valid: false, message: 'Mã voucher chưa có hiệu lực' };
    }

    if (now > validUntil) {
      return { valid: false, message: 'Mã voucher đã hết hạn' };
    }

    if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
      return { valid: false, message: 'Mã voucher đã hết lượt sử dụng' };
    }

    if (orderValue < voucher.min_order_value) {
      return { 
        valid: false, 
        message: `Đơn hàng tối thiểu ${voucher.min_order_value.toLocaleString('vi-VN')}đ` 
      };
    }

    return { valid: true, voucher };
  },

  // Tính toán số tiền giảm
  calculateDiscount(voucher, orderValue) {
    let discount = 0;

    if (voucher.discount_type === 'fixed') {
      discount = voucher.discount_value;
    } else if (voucher.discount_type === 'percentage') {
      discount = (orderValue * voucher.discount_value) / 100;
      
      // Áp dụng giảm tối đa nếu có (và khác 0)
      if (voucher.max_discount && voucher.max_discount > 0 && discount > voucher.max_discount) {
        discount = voucher.max_discount;
      }
    }

    // Đảm bảo giảm giá không vượt quá giá trị đơn hàng
    if (discount > orderValue) {
      discount = orderValue;
    }

    return Math.round(discount);
  }
};

export default voucherRepo;
