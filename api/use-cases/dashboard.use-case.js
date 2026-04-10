import dashboardRepo from '../repositories/dashboard.repo.js';
import orderRepo from '../repositories/order.repo.js';
import productRepo from '../repositories/product.repo.js';
import userRepo from '../repositories/user.repo.js';
import invoiceRepo from '../repositories/invoice.repo.js';

class DashboardService {
  // Lấy tất cả thống kê cho dashboard
  async getDashboardStats() {
    try {
      // 1. Thống kê đơn hàng
      const orderStats = await orderRepo.getOrderStats();

      // 2. Thống kê sản phẩm
      const productStats = await productRepo.getProductStats();

      // 3. Thống kê doanh thu từ INVOICES
      const invoiceStats = await invoiceRepo.getInvoiceStats();

      // 4. Thống kê users
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const memberCounts = await userRepo.countByStatus();
      const newMembersCount = await userRepo.countNewMembersThisMonth(startOfMonth);
      const recentMembers = await userRepo.getRecentMembers(5);

      // 5. Lịch học hôm nay
      const todaySchedules = await dashboardRepo.getTodaySchedules();

      // 6. Thông báo và cảnh báo
      const alerts = await dashboardRepo.getAlerts();

      // 7. Doanh thu theo tháng từ INVOICES (hóa đơn đã thanh toán)
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = await invoiceRepo.getMonthlyRevenue(currentYear);

      // 8. Hội viên mới 6 tháng gần nhất
      const newMembersLast6Months = await userRepo.getNewMembersLast6Months();

      // 9. Phân bổ gói tập
      const packageDistribution = await userRepo.getPackageDistribution();

      return {
        success: true,
        data: {
          // Thống kê chính
          stats: {
            totalMembers: memberCounts.total,
            newMembers: newMembersCount,
            totalRevenue: invoiceStats.monthRevenue, // Doanh thu tháng này từ invoices
            pendingOrders: orderStats.pendingOrders,
            totalProducts: productStats.totalProducts,
            lowStockProducts: productStats.lowStockCount,
            todayOrders: orderStats.todayOrders,
            activeClasses: todaySchedules.length
          },
          
          // Chi tiết đơn hàng theo trạng thái
          orderStatusCounts: orderStats.statusCounts,
          
          // Sản phẩm sắp hết
          lowStockProductsList: productStats.lowStockProducts,
          
          // Sản phẩm theo danh mục
          productsByCategory: productStats.productsByCategory,
          
          // Hội viên mới gần đây
          recentMembers: recentMembers,
          
          // Lịch học hôm nay
          todaySchedules: todaySchedules,
          
          // Cảnh báo
          alerts: alerts,

          // Doanh thu theo tháng
          monthlyRevenue: monthlyRevenue,
          currentYear: currentYear,

          // Hội viên mới 6 tháng gần nhất
          newMembersLast6Months: newMembersLast6Months,

          // Phân bổ gói tập
          packageDistribution: packageDistribution
        },
        message: 'Dashboard stats retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }
}

export default new DashboardService();
