import api from './api';

const authService = {
  // Đăng ký tài khoản mới
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Làm mới token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  // Kiểm tra token hiện tại
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error) {
      console.error('Validate token error:', error);
      throw error;
    }
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
};

export default authService;