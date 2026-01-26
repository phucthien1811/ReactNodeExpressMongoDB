const API_BASE_URL = 'http://localhost:4000/api/v1';

class TrainerService {
  // Lấy token từ localStorage
  getAuthToken() {
    const authData = localStorage.getItem('rf_auth_v1');
    if (authData) {
      const user = JSON.parse(authData);
      return user.token;
    }
    return null;
  }

  // Headers mặc định
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  // Lấy danh sách trainers
  async getAllTrainers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `${API_BASE_URL}/trainers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('TrainerService.getAllTrainers error:', error);
      throw error;
    }
  }

  // Lấy thông tin trainer theo ID
  async getTrainerById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('TrainerService.getTrainerById error:', error);
      throw error;
    }
  }

  // Tạo trainer mới
  async createTrainer(trainerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(trainerData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Tạo huấn luyện viên thất bại');
      }

      return result;
    } catch (error) {
      console.error('TrainerService.createTrainer error:', error);
      throw error;
    }
  }

  // Cập nhật trainer
  async updateTrainer(id, trainerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(trainerData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Cập nhật huấn luyện viên thất bại');
      }

      return result;
    } catch (error) {
      console.error('TrainerService.updateTrainer error:', error);
      throw error;
    }
  }

  // Xóa trainer
  async deleteTrainer(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Xóa huấn luyện viên thất bại');
      }

      return result;
    } catch (error) {
      console.error('TrainerService.deleteTrainer error:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái trainer
  async updateTrainerStatus(id, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers/${id}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Cập nhật trạng thái thất bại');
      }

      return result;
    } catch (error) {
      console.error('TrainerService.updateTrainerStatus error:', error);
      throw error;
    }
  }

  // Lấy thống kê trainers
  async getTrainerStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/trainers/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('TrainerService.getTrainerStats error:', error);
      throw error;
    }
  }
}

const trainerService = new TrainerService();
export default trainerService;