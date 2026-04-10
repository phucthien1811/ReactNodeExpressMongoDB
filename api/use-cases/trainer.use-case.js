import trainerRepo from '../repositories/trainer.repo.js';

class TrainerService {
  // Lấy danh sách trainers
  async getAllTrainers(filters = {}) {
    try {
      const trainers = await trainerRepo.findAll(filters);
      return {
        success: true,
        data: trainers
      };
    } catch (error) {
      console.error('TrainerService.getAllTrainers error:', error);
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách huấn luyện viên'
      };
    }
  }

  // Lấy trainers với phân trang
  async getTrainersWithPagination(params) {
    try {
      const result = await trainerRepo.findWithPagination(params);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error('TrainerService.getTrainersWithPagination error:', error);
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách huấn luyện viên'
      };
    }
  }

  // Lấy thông tin trainer theo ID
  async getTrainerById(id) {
    try {
      const trainer = await trainerRepo.findById(id);
      if (!trainer) {
        return {
          success: false,
          message: 'Không tìm thấy huấn luyện viên'
        };
      }

      return {
        success: true,
        data: trainer
      };
    } catch (error) {
      console.error('TrainerService.getTrainerById error:', error);
      return {
        success: false,
        message: 'Lỗi khi lấy thông tin huấn luyện viên'
      };
    }
  }

  // Tạo trainer mới
  async createTrainer(trainerData) {
    try {
      // Kiểm tra email đã tồn tại
      const existingTrainer = await trainerRepo.findByEmail(trainerData.email);
      if (existingTrainer) {
        return {
          success: false,
          message: 'Email đã được sử dụng'
        };
      }

      // Validate required fields
      if (!trainerData.name || !trainerData.email) {
        return {
          success: false,
          message: 'Tên và email là bắt buộc'
        };
      }

      const trainer = await trainerRepo.create(trainerData);
      return {
        success: true,
        data: trainer,
        message: 'Tạo huấn luyện viên thành công'
      };
    } catch (error) {
      console.error('TrainerService.createTrainer error:', error);
      return {
        success: false,
        message: 'Lỗi khi tạo huấn luyện viên'
      };
    }
  }

  // Cập nhật trainer
  async updateTrainer(id, trainerData) {
    try {
      // Kiểm tra trainer có tồn tại
      const existingTrainer = await trainerRepo.findById(id);
      if (!existingTrainer) {
        return {
          success: false,
          message: 'Không tìm thấy huấn luyện viên'
        };
      }

      // Kiểm tra email trùng (nếu thay đổi email)
      if (trainerData.email && trainerData.email !== existingTrainer.email) {
        const emailExists = await trainerRepo.findByEmail(trainerData.email);
        if (emailExists) {
          return {
            success: false,
            message: 'Email đã được sử dụng'
          };
        }
      }

      const trainer = await trainerRepo.update(id, trainerData);
      return {
        success: true,
        data: trainer,
        message: 'Cập nhật huấn luyện viên thành công'
      };
    } catch (error) {
      console.error('TrainerService.updateTrainer error:', error);
      return {
        success: false,
        message: 'Lỗi khi cập nhật huấn luyện viên'
      };
    }
  }

  // Xóa trainer
  async deleteTrainer(id) {
    try {
      const trainer = await trainerRepo.findById(id);
      if (!trainer) {
        return {
          success: false,
          message: 'Không tìm thấy huấn luyện viên'
        };
      }

      await trainerRepo.delete(id);
      return {
        success: true,
        message: 'Xóa huấn luyện viên thành công'
      };
    } catch (error) {
      console.error('TrainerService.deleteTrainer error:', error);
      return {
        success: false,
        message: 'Lỗi khi xóa huấn luyện viên'
      };
    }
  }

  // Cập nhật trạng thái trainer
  async updateTrainerStatus(id, status) {
    try {
      const trainer = await trainerRepo.findById(id);
      if (!trainer) {
        return {
          success: false,
          message: 'Không tìm thấy huấn luyện viên'
        };
      }

      const updatedTrainer = await trainerRepo.updateStatus(id, status);
      return {
        success: true,
        data: updatedTrainer,
        message: 'Cập nhật trạng thái thành công'
      };
    } catch (error) {
      console.error('TrainerService.updateTrainerStatus error:', error);
      return {
        success: false,
        message: 'Lỗi khi cập nhật trạng thái'
      };
    }
  }

  // Lấy thống kê
  async getTrainerStats() {
    try {
      const stats = await trainerRepo.getStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('TrainerService.getTrainerStats error:', error);
      return {
        success: false,
        message: 'Lỗi khi lấy thống kê'
      };
    }
  }
}

export default new TrainerService();
