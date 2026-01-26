import db from '../config/knex.js';

class DashboardRepository {
  // Lấy lịch học hôm nay
  async getTodaySchedules() {
    const today = new Date().toISOString().split('T')[0];
    
    const schedules = await db('schedules')
      .leftJoin('trainers', 'schedules.trainer_id', 'trainers.id')
      .leftJoin('class_enrollments', 'schedules.id', 'class_enrollments.schedule_id')
      .select(
        'schedules.id',
        'schedules.class_name',
        'schedules.start_time',
        'schedules.end_time',
        'schedules.class_date',
        'schedules.room',
        'schedules.floor',
        'schedules.max_participants',
        'trainers.name as trainer_name',
        db.raw('COUNT(class_enrollments.id) as current_participants')
      )
      .where('schedules.class_date', '>=', today)
      .groupBy(
        'schedules.id',
        'schedules.class_name',
        'schedules.start_time',
        'schedules.end_time',
        'schedules.class_date',
        'schedules.room',
        'schedules.floor',
        'schedules.max_participants',
        'trainers.name'
      )
      .orderBy('schedules.start_time', 'asc')
      .limit(10);

    return schedules;
  }

  // Lấy thông báo động
  async getAlerts() {
    const alerts = [];

    // Đơn hàng chờ xử lý
    const [pendingOrders] = await db('orders')
      .where('status', 'pending')
      .count('* as count');
    
    if (pendingOrders.count > 0) {
      alerts.push({
        type: 'warning',
        message: `Có ${pendingOrders.count} đơn hàng chưa xử lý`,
        time: 'Hiện tại',
        priority: 'high'
      });
    }

    // Sản phẩm sắp hết hàng
    const lowStockProducts = await db('products')
      .where('stock', '>', 0)
      .where('stock', '<=', 10)
      .select('name', 'stock');

    if (lowStockProducts.length > 0) {
      lowStockProducts.slice(0, 3).forEach(product => {
        alerts.push({
          type: 'danger',
          message: `Sản phẩm "${product.name}" sắp hết hàng (còn ${product.stock})`,
          time: 'Hôm nay',
          priority: 'medium'
        });
      });
    }

    // Lớp học sắp đầy
    const today = new Date().toISOString().split('T')[0];
    const nearFullClasses = await db('schedules')
      .leftJoin('class_enrollments', 'schedules.id', 'class_enrollments.schedule_id')
      .select(
        'schedules.class_name',
        'schedules.max_participants',
        db.raw('COUNT(class_enrollments.id) as current_participants')
      )
      .where('schedules.class_date', '>=', today)
      .groupBy('schedules.id', 'schedules.class_name', 'schedules.max_participants')
      .havingRaw('COUNT(class_enrollments.id) >= schedules.max_participants * 0.8');

    nearFullClasses.slice(0, 2).forEach(classItem => {
      alerts.push({
        type: 'info',
        message: `Lớp "${classItem.class_name}" sắp đầy (${classItem.current_participants}/${classItem.max_participants})`,
        time: 'Hôm nay',
        priority: 'low'
      });
    });

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 5);
  }
}

export default new DashboardRepository();
