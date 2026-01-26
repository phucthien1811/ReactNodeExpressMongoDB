import api from './api';

const scheduleService = {
  // Lấy tất cả lịch tập của user hiện tại
  getMyEnrollments: async () => {
    try {
      const response = await api.get('/schedules/my-enrollments');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching my enrollments:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Không thể lấy lịch tập' 
      };
    }
  },

  // Lấy lịch tập hôm nay
  getTodaySchedule: async () => {
    try {
      const response = await api.get('/schedules/my-enrollments');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Lọc các lịch tập hôm nay
      const todayClasses = response.data.filter(enrollment => {
        const classDate = new Date(enrollment.class_date);
        classDate.setHours(0, 0, 0, 0);
        return classDate.getTime() === today.getTime();
      });

      return { success: true, data: todayClasses };
    } catch (error) {
      console.error('Error fetching today schedule:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Không thể lấy lịch tập hôm nay' 
      };
    }
  },

  // Đăng ký lớp học
  enrollClass: async (scheduleId) => {
    try {
      const response = await api.post(`/schedules/${scheduleId}/enroll`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error enrolling class:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Không thể đăng ký lớp học' 
      };
    }
  },

  // Hủy đăng ký lớp học
  unenrollClass: async (scheduleId) => {
    try {
      const response = await api.delete(`/schedules/${scheduleId}/enroll`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error unenrolling class:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Không thể hủy đăng ký lớp học' 
      };
    }
  },

  // Lấy danh sách tất cả lịch học (để đăng ký)
  getAllSchedules: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.trainer_id) params.append('trainer_id', filters.trainer_id);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.status) params.append('status', filters.status);
      if (filters.class_name) params.append('class_name', filters.class_name);

      const response = await api.get(`/schedules?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Không thể lấy danh sách lịch học' 
      };
    }
  }
};

export default scheduleService;
