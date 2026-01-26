import memberPackageRepo from '../repositories/member-package.repo.js';
import packageRepo from '../repositories/package.repo.js';
import memberRepo from '../repositories/member.repo.js';
import db from '../config/knex.js';

export const memberPackageService = {
  // Lấy packages của member
  async getMemberPackages(memberId) {
    try {
      const packages = await memberPackageRepo.findByMemberId(memberId);
      return {
        success: true,
        data: packages
      };
    } catch (error) {
      throw new Error(`Error fetching member packages: ${error.message}`);
    }
  },

  // Lấy package hiện tại của member
  async getCurrentPackage(memberId) {
    try {
      const currentPackage = await memberPackageRepo.getCurrentPackage(memberId);
      return {
        success: true,
        data: currentPackage
      };
    } catch (error) {
      throw new Error(`Error fetching current package: ${error.message}`);
    }
  },

  // Đăng ký package cho member
  async registerPackage(memberId, packageId, paidAmount, notes = '') {
    try {
      // Kiểm tra user tồn tại (thay vì member)
      const user = await db('users').where('id', memberId).first();
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Kiểm tra package tồn tại và active
      const packageData = await packageRepo.findById(packageId);
      if (!packageData || !packageData.is_active) {
        return {
          success: false,
          message: 'Package not found or inactive'
        };
      }

      // Tính toán ngày bắt đầu và kết thúc
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + packageData.duration_days);

      // Tạo member package mới
      const memberPackageData = {
        user_id: memberId, // Changed from member_id to user_id
        package_id: packageId,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        paid_amount: paidAmount,
        notes: notes
      };

      const newMemberPackage = await memberPackageRepo.create(memberPackageData);

      return {
        success: true,
        data: newMemberPackage,
        message: 'Package registered successfully'
      };
    } catch (error) {
      throw new Error(`Error registering package: ${error.message}`);
    }
  },

  // Gia hạn package
  async extendPackage(memberPackageId, days, additionalAmount = 0) {
    try {
      const memberPackage = await memberPackageRepo.findById(memberPackageId);
      if (!memberPackage) {
        return {
          success: false,
          message: 'Member package not found'
        };
      }

      const extendedPackage = await memberPackageRepo.extend(memberPackageId, days);
      
      // Cập nhật số tiền nếu có
      if (additionalAmount > 0) {
        const newPaidAmount = parseFloat(memberPackage.paid_amount) + parseFloat(additionalAmount);
        await memberPackageRepo.update(memberPackageId, {
          paid_amount: newPaidAmount
        });
      }

      return {
        success: true,
        data: extendedPackage,
        message: 'Package extended successfully'
      };
    } catch (error) {
      throw new Error(`Error extending package: ${error.message}`);
    }
  },

  // Hủy package
  async cancelPackage(memberPackageId, reason = '') {
    try {
      const memberPackage = await memberPackageRepo.findById(memberPackageId);
      if (!memberPackage) {
        return {
          success: false,
          message: 'Member package not found'
        };
      }

      const cancelledPackage = await memberPackageRepo.updateStatus(memberPackageId, 'cancelled');
      
      // Cập nhật ghi chú lý do hủy
      if (reason) {
        await db('member_packages').where('id', memberPackageId).update({
          notes: memberPackage.notes ? `${memberPackage.notes}\n\nCancelled: ${reason}` : `Cancelled: ${reason}`
        });
      }

      return {
        success: true,
        data: cancelledPackage,
        message: 'Package cancelled successfully'
      };
    } catch (error) {
      throw new Error(`Error cancelling package: ${error.message}`);
    }
  },

  // Lấy tất cả member packages (cho admin)
  async getAllMemberPackages(filters = {}) {
    try {
      const memberPackages = await memberPackageRepo.findAll(filters);
      return {
        success: true,
        data: memberPackages
      };
    } catch (error) {
      throw new Error(`Error fetching member packages: ${error.message}`);
    }
  },

  // Cập nhật packages hết hạn tự động
  async updateExpiredPackages() {
    try {
      const updated = await memberPackageRepo.updateExpiredPackages();
      return {
        success: true,
        message: `Updated ${updated} expired packages`
      };
    } catch (error) {
      throw new Error(`Error updating expired packages: ${error.message}`);
    }
  },

  // Thống kê packages
  async getPackageStats() {
    try {
      const allPackages = await memberPackageRepo.findAll();
      const activePackages = allPackages.filter(p => p.status === 'active');
      const expiredPackages = allPackages.filter(p => p.status === 'expired');
      const cancelledPackages = allPackages.filter(p => p.status === 'cancelled');

      return {
        success: true,
        data: {
          total: allPackages.length,
          active: activePackages.length,
          expired: expiredPackages.length,
          cancelled: cancelledPackages.length
        }
      };
    } catch (error) {
      throw new Error(`Error getting package stats: ${error.message}`);
    }
  },

  // Xóa member khỏi gói
  async removeMemberFromPackage(memberPackageId) {
    try {
      const memberPackage = await memberPackageRepo.findById(memberPackageId);
      if (!memberPackage) {
        return {
          success: false,
          message: 'Member package not found'
        };
      }

      // Xóa member package
      await memberPackageRepo.delete(memberPackageId);

      return {
        success: true,
        message: 'Member removed from package successfully'
      };
    } catch (error) {
      throw new Error(`Error removing member from package: ${error.message}`);
    }
  },

  // Thêm member vào gói miễn phí
  async addMemberToPackageFree(userId, packageId, notes = '') {
    try {
      // Kiểm tra user tồn tại
      const user = await db('users').where('id', userId).first();
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Kiểm tra package tồn tại
      const packageData = await packageRepo.findById(packageId);
      if (!packageData) {
        return {
          success: false,
          message: 'Package not found'
        };
      }

      // Tính toán ngày bắt đầu và kết thúc
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + packageData.duration_days);

      // Tạo member package mới với giá 0 (miễn phí)
      const memberPackageData = {
        user_id: userId,
        package_id: packageId,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        paid_amount: 0, // Miễn phí
        notes: notes || 'Gói miễn phí được tặng bởi admin'
      };

      const newMemberPackage = await memberPackageRepo.create(memberPackageData);

      return {
        success: true,
        data: newMemberPackage,
        message: 'Member added to package successfully (Free)'
      };
    } catch (error) {
      throw new Error(`Error adding member to package: ${error.message}`);
    }
  }
};

export default memberPackageService;