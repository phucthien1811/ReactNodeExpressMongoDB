import trainerService from '../services/trainer.js';

class TrainerController {
  // GET /api/v1/trainers - Lấy danh sách trainers
  async getAllTrainers(req, res) {
    try {
      const { search, status, page, limit } = req.query;
      
      let result;
      if (page && limit) {
        // Phân trang
        result = await trainerService.getTrainersWithPagination({
          page: parseInt(page),
          limit: parseInt(limit),
          search,
          status
        });
      } else {
        // Lấy tất cả
        result = await trainerService.getAllTrainers({ search, status });
      }

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('TrainerController.getAllTrainers error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }

  // GET /api/v1/trainers/:id - Lấy thông tin trainer theo ID
  async getTrainerById(req, res) {
    try {
      const { id } = req.params;
      const result = await trainerService.getTrainerById(id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('TrainerController.getTrainerById error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }

  // POST /api/v1/trainers - Tạo trainer mới
  async createTrainer(req, res) {
    try {
      const trainerData = req.body;
      const result = await trainerService.createTrainer(trainerData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('TrainerController.createTrainer error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }

  // PUT /api/v1/trainers/:id - Cập nhật trainer
  async updateTrainer(req, res) {
    try {
      const { id } = req.params;
      const trainerData = req.body;
      const result = await trainerService.updateTrainer(id, trainerData);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('TrainerController.updateTrainer error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }

  // DELETE /api/v1/trainers/:id - Xóa trainer
  async deleteTrainer(req, res) {
    try {
      const { id } = req.params;
      const result = await trainerService.deleteTrainer(id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('TrainerController.deleteTrainer error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }

  // PATCH /api/v1/trainers/:id/status - Cập nhật trạng thái trainer
  async updateTrainerStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ'
        });
      }

      const result = await trainerService.updateTrainerStatus(id, status);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('TrainerController.updateTrainerStatus error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }

  // GET /api/v1/trainers/stats - Lấy thống kê trainers
  async getTrainerStats(req, res) {
    try {
      const result = await trainerService.getTrainerStats();

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('TrainerController.getTrainerStats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
}

export default new TrainerController();
