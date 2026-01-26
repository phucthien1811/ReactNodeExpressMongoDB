import memberProfileRepo from '../repositories/member-profile.repo.js';

class MemberProfileService {
  // Lấy profile của user hiện tại
  async getUserProfile(userId) {
    try {
      const profile = await memberProfileRepo.getProfileByUserId(userId);
      
      if (!profile) {
        throw new Error('Profile not found');
      }

      return {
        success: true,
        data: profile,
        message: 'Profile retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  // Cập nhật profile
  async updateUserProfile(userId, profileData) {
    try {
      // Validate data
      if (profileData.height && (profileData.height < 50 || profileData.height > 300)) {
        throw new Error('Chiều cao phải từ 50cm đến 300cm');
      }

      if (profileData.weight && (profileData.weight < 10 || profileData.weight > 500)) {
        throw new Error('Cân nặng phải từ 10kg đến 500kg');
      }

      if (profileData.phone && !/^[0-9]{10,11}$/.test(profileData.phone.replace(/\s/g, ''))) {
        throw new Error('Số điện thoại không hợp lệ');
      }

      // Check if profile exists, create if not
      let profile = await memberProfileRepo.getProfileByUserId(userId);
      
      if (!profile) {
        await memberProfileRepo.createProfile(userId, profileData);
      } else {
        await memberProfileRepo.updateProfile(userId, profileData);
      }

      // Always fetch the updated profile with full user data
      const updatedProfile = await memberProfileRepo.getProfileByUserId(userId);

      return {
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  // Upload avatar
  async updateAvatar(userId, avatarUrl) {
    try {
      const profile = await memberProfileRepo.updateProfile(userId, { avatar_url: avatarUrl });
      
      return {
        success: true,
        data: profile,
        message: 'Avatar updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update avatar: ${error.message}`);
    }
  }

  // Admin: Lấy tất cả profiles
  async getAllProfiles(filters = {}) {
    try {
      const result = await memberProfileRepo.getAllProfiles(filters);
      
      return {
        success: true,
        data: result,
        message: 'Profiles retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get profiles: ${error.message}`);
    }
  }

  // Admin: Cập nhật membership info
  async updateMembershipInfo(userId, membershipData) {
    try {
      const profile = await memberProfileRepo.updateMembershipInfo(userId, membershipData);
      
      return {
        success: true,
        data: profile,
        message: 'Membership info updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update membership info: ${error.message}`);
    }
  }

  // Admin: Xóa profile
  async deleteProfile(userId) {
    try {
      await memberProfileRepo.deleteProfile(userId);
      
      return {
        success: true,
        message: 'Profile deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete profile: ${error.message}`);
    }
  }

  // Tính BMI
  calculateBMI(height, weight) {
    if (!height || !weight) return null;
    return (weight / Math.pow(height / 100, 2)).toFixed(2);
  }

  // Đánh giá BMI
  getBMICategory(bmi) {
    if (!bmi) return 'Chưa có dữ liệu';
    
    if (bmi < 18.5) return 'Thiếu cân';
    if (bmi < 25) return 'Bình thường';
    if (bmi < 30) return 'Thừa cân';
    return 'Béo phì';
  }
}

export default new MemberProfileService();