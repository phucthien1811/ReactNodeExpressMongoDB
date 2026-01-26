import packageRepo from '../repositories/package.repo.js';
import memberPackageRepo from '../repositories/member-package.repo.js';

export const packageService = {
  // Lấy danh sách packages cho admin
  async getAllPackages(filters = {}) {
    try {
      const packages = await packageRepo.findAllWithStats();
      return {
        success: true,
        data: packages
      };
    } catch (error) {
      throw new Error(`Error fetching packages: ${error.message}`);
    }
  },

  // Lấy danh sách packages public (cho member)
  async getPublicPackages() {
    try {
      const packages = await packageRepo.findAll({
        isActive: true,
        isPublished: true
      });
      return {
        success: true,
        data: packages
      };
    } catch (error) {
      throw new Error(`Error fetching public packages: ${error.message}`);
    }
  },

  // Lấy package theo ID
  async getPackageById(id) {
    try {
      const packageData = await packageRepo.findById(id);
      if (!packageData) {
        return {
          success: false,
          message: 'Package not found'
        };
      }

      return {
        success: true,
        data: packageData
      };
    } catch (error) {
      throw new Error(`Error fetching package: ${error.message}`);
    }
  },

  // Tạo package mới
  async createPackage(packageData) {
    try {
      // Stringify features nếu là array
      if (Array.isArray(packageData.features)) {
        packageData.features = JSON.stringify(packageData.features);
      }

      const newPackage = await packageRepo.create(packageData);
      return {
        success: true,
        data: newPackage,
        message: 'Package created successfully'
      };
    } catch (error) {
      throw new Error(`Error creating package: ${error.message}`);
    }
  },

  // Cập nhật package
  async updatePackage(id, packageData) {
    try {
      const existingPackage = await packageRepo.findById(id);
      if (!existingPackage) {
        return {
          success: false,
          message: 'Package not found'
        };
      }

      // Stringify features nếu là array
      if (Array.isArray(packageData.features)) {
        packageData.features = JSON.stringify(packageData.features);
      }

      const updatedPackage = await packageRepo.update(id, packageData);
      return {
        success: true,
        data: updatedPackage,
        message: 'Package updated successfully'
      };
    } catch (error) {
      throw new Error(`Error updating package: ${error.message}`);
    }
  },

  // Xóa package
  async deletePackage(id) {
    try {
      const existingPackage = await packageRepo.findById(id);
      if (!existingPackage) {
        return {
          success: false,
          message: 'Package not found'
        };
      }

      // Kiểm tra xem có member nào đang sử dụng package này không
      const activeMembers = await memberPackageRepo.findAll({
        packageId: id,
        status: 'active'
      });

      if (activeMembers.length > 0) {
        return {
          success: false,
          message: 'Cannot delete package with active members'
        };
      }

      await packageRepo.delete(id);
      return {
        success: true,
        message: 'Package deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting package: ${error.message}`);
    }
  },

  // Lấy danh sách members của package
  async getPackageMembers(packageId, filters = {}) {
    try {
      const members = await packageRepo.getPackageMembers(packageId, filters);
      return {
        success: true,
        data: members
      };
    } catch (error) {
      throw new Error(`Error fetching package members: ${error.message}`);
    }
  },

  // Toggle published status
  async togglePublished(id) {
    try {
      const packageData = await packageRepo.findById(id);
      if (!packageData) {
        return {
          success: false,
          message: 'Package not found'
        };
      }

      const updatedPackage = await packageRepo.update(id, {
        is_published: !packageData.is_published
      });

      return {
        success: true,
        data: updatedPackage,
        message: `Package ${updatedPackage.is_published ? 'published' : 'unpublished'} successfully`
      };
    } catch (error) {
      throw new Error(`Error toggling package status: ${error.message}`);
    }
  }
};

export default packageService;