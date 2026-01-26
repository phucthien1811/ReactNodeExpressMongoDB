import api from './api';

class MemberProfileService {
    // Lấy thông tin profile của member hiện tại
    async getProfile() {
        try {
            const response = await api.get('/member-profiles/my-profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching member profile:', error);
            throw error;
        }
    }

    // Cập nhật profile (với FormData để hỗ trợ file upload)
    async updateProfile(profileData) {
        try {
            const response = await api.put('/member-profiles/my-profile', profileData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating member profile:', error);
            throw error;
        }
    }

    // Upload avatar riêng
    async uploadAvatar(avatarFile) {
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            
            const response = await api.post('/member-profiles/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    }

    // Lấy thống kê member (cho admin)
    async getMemberStats() {
        try {
            const response = await api.get('/member-profiles/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching member stats:', error);
            throw error;
        }
    }

    // Admin: Lấy danh sách tất cả member profiles
    async getAllProfiles(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await api.get(`/member-profiles?${queryString}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all member profiles:', error);
            throw error;
        }
    }

    // Admin: Lấy profile của member cụ thể
    async getProfileById(memberId) {
        try {
            const response = await api.get(`/member-profiles/${memberId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching member profile by ID:', error);
            throw error;
        }
    }

    // Admin: Cập nhật profile của member cụ thể
    async updateProfileById(memberId, profileData) {
        try {
            const response = await api.put(`/member-profiles/${memberId}`, profileData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating member profile by ID:', error);
            throw error;
        }
    }

    // Admin: Xóa profile member
    async deleteProfile(memberId) {
        try {
            const response = await api.delete(`/member-profiles/${memberId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting member profile:', error);
            throw error;
        }
    }
}

export const memberProfileService = new MemberProfileService();
export default memberProfileService;