import memberPackageService from '../use-cases/member-package.use-case.js';
import packageValidation from '../validations/package.js';

export const memberPackageController = {
  async getAllMemberPackages(req, res) {
    try {
      const result = await memberPackageService.getAllMemberPackages(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getMemberPackages(req, res) {
    try {
      const { memberId } = req.params;
      const result = await memberPackageService.getMemberPackages(memberId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getCurrentPackage(req, res) {
    try {
      const { memberId } = req.params;
      const result = await memberPackageService.getCurrentPackage(memberId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async registerPackage(req, res) {
    try {
      const { user_id, package_id, paid_amount, notes } = req.body;
      
      console.log('Register package data:', { user_id, package_id, paid_amount, notes });
      
      const result = await memberPackageService.registerPackage(user_id, package_id, paid_amount, notes);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Register package error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async extendPackage(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = packageValidation.extend.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { days, additional_amount } = value;
      const result = await memberPackageService.extendPackage(id, days, additional_amount);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async cancelPackage(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = packageValidation.cancel.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { reason } = value;
      const result = await memberPackageService.cancelPackage(id, reason);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateExpiredPackages(req, res) {
    try {
      const result = await memberPackageService.updateExpiredPackages();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getPackageStats(req, res) {
    try {
      const result = await memberPackageService.getPackageStats();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Xóa member khỏi gói
  async removeMemberFromPackage(req, res) {
    try {
      const { memberPackageId } = req.params;
      const result = await memberPackageService.removeMemberFromPackage(memberPackageId);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Thêm member vào gói miễn phí
  async addMemberToPackageFree(req, res) {
    try {
      const { user_id, package_id, notes } = req.body;
      
      if (!user_id || !package_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id và package_id là bắt buộc'
        });
      }
      
      const result = await memberPackageService.addMemberToPackageFree(user_id, package_id, notes);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default memberPackageController;
