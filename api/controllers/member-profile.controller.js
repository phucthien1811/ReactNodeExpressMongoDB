import memberProfileService from '../services/member-profile.service.js';
import { successResponse, errorResponse } from '../utils/resonse.js';

class MemberProfileController {
  async getMyProfile(req, res) {
    try {
      const userId = req.user.id || req.user.sub;
      
      if (!userId) {
        return errorResponse(res, 'User ID not found', 400);
      }

      const result = await memberProfileService.getUserProfile(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateMyProfile(req, res) {
    try {
      const userId = req.user.id || req.user.sub;
      
      if (!userId) {
        return errorResponse(res, 'User ID not found', 400);
      }

      // console.log('🔍 Request body:', req.body);
      // console.log('🔍 Request body type:', typeof req.body);
      // console.log('🔍 Request file:', req.file);
      let profileData = { ...req.body };
      if (req.file) {
        profileData.avatar_url = `/uploads/avatars/${req.file.filename}`;
        console.log('📷 Avatar uploaded:', profileData.avatar_url);
      }

      const result = await memberProfileService.updateUserProfile(userId, profileData);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('❌ Controller error:', error);
      return errorResponse(res, error.message, 400);
    }
  }
  async uploadAvatar(req, res) {
    try {
      const userId = req.user.id || req.user.sub;
      
      if (!userId) {
        return errorResponse(res, 'User ID not found', 400);
      }

      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }

   
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const result = await memberProfileService.updateAvatar(userId, avatarUrl);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
//Admin
  async getAllProfiles(req, res) {
    try {
      const { page, limit, search, role } = req.query;
      
      const filters = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      };
      
      if (search) filters.search = search;
      if (role) filters.role = role;

      const result = await memberProfileService.getAllProfiles(filters);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Lấy profile của user other
  async getProfileById(req, res) {
    try {
      const { userId } = req.params;
      
      const result = await memberProfileService.getUserProfile(userId);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      return errorResponse(res, error.message, statusCode);
    }
  }

  // Cập nhật profile của user khác
  async updateProfileById(req, res) {
    try {
      const { userId } = req.params;
      
      const result = await memberProfileService.updateUserProfile(userId, req.body);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Cập nhật thông tin membership
  async updateMembershipInfo(req, res) {
    try {
      const { userId } = req.params;
      
      const result = await memberProfileService.updateMembershipInfo(userId, req.body);
      return successResponse(res, result.data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Xóa profile
  async deleteProfile(req, res) {
    try {
      const { userId } = req.params;
      
      const result = await memberProfileService.deleteProfile(userId);
      return successResponse(res, null, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default new MemberProfileController();