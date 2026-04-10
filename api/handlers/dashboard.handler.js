import dashboardService from '../use-cases/dashboard.use-case.js';
import { successResponse, errorResponse } from '../utils/resonse.js';

class DashboardController {
  async getDashboardStats(req, res) {
    try {
      const result = await dashboardService.getDashboardStats();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

export default new DashboardController();
