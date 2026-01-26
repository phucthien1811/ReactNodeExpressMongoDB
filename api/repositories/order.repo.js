import db from '../config/knex.js';

class OrderRepository {
  // Tạo đơn hàng mới
  async createOrder(orderData) {
    const trx = await db.transaction();
    
    try {
      // Tạo order number unique
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Insert order
      const [orderId] = await trx('orders').insert({
        user_id: orderData.user_id,
        order_number: orderNumber,
        total_amount: orderData.total_amount,
        shipping_fee: orderData.shipping_fee || 0,
        discount_amount: orderData.discount_amount || 0,
        shipping_address: JSON.stringify(orderData.shipping_address),
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status || 'pending',
        notes: orderData.notes || null
      });

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.total_price
      }));

      await trx('order_items').insert(orderItems);
      
      await trx.commit();
      
      // Lấy order với items
      return await this.getOrderById(orderId);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Lấy đơn hàng theo ID
  async getOrderById(orderId) {
    const order = await db('orders')
      .select('*')
      .where('id', orderId)
      .first();

    if (!order) return null;

    const items = await db('order_items as oi')
      .select(
        'oi.*',
        'p.image_url as product_image'
      )
      .leftJoin('products as p', 'oi.product_id', 'p.id')
      .where('oi.order_id', orderId);

    return {
      ...order,
      shipping_address: JSON.parse(order.shipping_address),
      items
    };
  }

  // Lấy đơn hàng theo order number
  async getOrderByNumber(orderNumber) {
    const order = await db('orders')
      .select('*')
      .where('order_number', orderNumber)
      .first();

    if (!order) return null;

    const items = await db('order_items as oi')
      .select(
        'oi.*',
        'p.image_url as product_image'
      )
      .leftJoin('products as p', 'oi.product_id', 'p.id')
      .where('oi.order_id', order.id);

    return {
      ...order,
      shipping_address: JSON.parse(order.shipping_address),
      items
    };
  }

  // Lấy đơn hàng của user
  async getOrdersByUserId(userId, { page = 1, limit = 10, status = null } = {}) {
    let query = db('orders')
      .select('*')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    if (status) {
      query = query.where('status', status);
    }

    const offset = (page - 1) * limit;
    const orders = await query.limit(limit).offset(offset);

    // Lấy items cho từng order
    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const items = await db('order_items as oi')
          .select(
            'oi.*',
            'p.image_url as product_image'
          )
          .leftJoin('products as p', 'oi.product_id', 'p.id')
          .where('oi.order_id', order.id);

        return {
          ...order,
          shipping_address: JSON.parse(order.shipping_address),
          items
        };
      })
    );

    // Đếm tổng số orders
    const totalQuery = db('orders').count('* as count').where('user_id', userId);
    if (status) {
      totalQuery.where('status', status);
    }
    const [{ count }] = await totalQuery;

    return {
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total: parseInt(count),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Lấy tất cả đơn hàng (admin)
  async getAllOrders({ page = 1, limit = 10, status = null, search = null } = {}) {
    let query = db('orders')
      .select('orders.*', 'users.email as user_email', 'users.name as user_name')
      .leftJoin('users', 'orders.user_id', 'users.id')
      .orderBy('orders.created_at', 'desc');

    if (status) {
      query = query.where('orders.status', status);
    }

    if (search) {
      query = query.where(builder => {
        builder.where('orders.order_number', 'like', `%${search}%`)
               .orWhere('users.email', 'like', `%${search}%`)
               .orWhere('users.name', 'like', `%${search}%`);
      });
    }

    const offset = (page - 1) * limit;
    const orders = await query.limit(limit).offset(offset);

    // Lấy items cho từng order
    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const items = await db('order_items as oi')
          .select(
            'oi.*',
            'p.image_url as product_image'
          )
          .leftJoin('products as p', 'oi.product_id', 'p.id')
          .where('oi.order_id', order.id);

        return {
          ...order,
          shipping_address: JSON.parse(order.shipping_address),
          items
        };
      })
    );

    // Đếm tổng số orders
    let totalQuery = db('orders').count('* as count');
    if (status) {
      totalQuery = totalQuery.where('status', status);
    }
    if (search) {
      totalQuery = totalQuery.leftJoin('users', 'orders.user_id', 'users.id')
        .where(builder => {
          builder.where('orders.order_number', 'like', `%${search}%`)
                 .orWhere('users.email', 'like', `%${search}%`)
                 .orWhere('users.name', 'like', `%${search}%`);
        });
    }
    const [{ count }] = await totalQuery;

    return {
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total: parseInt(count),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, status, notes = null) {
    const updateData = { 
      status,
      updated_at: new Date()
    };
    
    if (notes) {
      updateData.notes = notes;
    }

    const result = await db('orders')
      .where('id', orderId)
      .update(updateData);

    if (result === 0) {
      throw new Error('Order not found');
    }

    return await this.getOrderById(orderId);
  }

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(orderId, paymentStatus) {
    const result = await db('orders')
      .where('id', orderId)
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date()
      });

    if (result === 0) {
      throw new Error('Order not found');
    }

    return await this.getOrderById(orderId);
  }

  // Thống kê đơn hàng
  async getOrderStats() {
    const stats = await db('orders')
      .select('status')
      .count('* as count')
      .groupBy('status');

    const totalRevenue = await db('orders')
      .where('payment_status', 'paid')
      .sum('total_amount as revenue')
      .first();

    const todayOrders = await db('orders')
      .whereRaw('DATE(created_at) = CURDATE()')
      .count('* as count')
      .first();

    // Count pending orders (status = 'pending')
    const pendingOrders = await db('orders')
      .where('status', 'pending')
      .count('* as count')
      .first();

    return {
      statusCounts: stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {}),
      totalRevenue: parseFloat(totalRevenue.revenue || 0),
      todayOrders: parseInt(todayOrders.count || 0),
      pendingOrders: parseInt(pendingOrders.count || 0)
    };
  }

  // Lấy doanh thu theo tháng trong năm
  async getMonthlyRevenue(year = new Date().getFullYear()) {
    const monthlyRevenue = await db('orders')
      .select(db.raw('MONTH(created_at) as month'))
      .sum('total_amount as revenue')
      .whereRaw('YEAR(created_at) = ?', [year])
      .where('payment_status', 'paid')
      .groupBy(db.raw('MONTH(created_at)'))
      .orderBy(db.raw('MONTH(created_at)'));

    // Tạo array 12 tháng, điền 0 cho tháng không có dữ liệu
    const revenueByMonth = Array(12).fill(0);
    monthlyRevenue.forEach(item => {
      revenueByMonth[item.month - 1] = parseFloat(item.revenue || 0);
    });

    return revenueByMonth;
  }

  // Xóa đơn hàng (soft delete)
  async deleteOrder(orderId) {
    const result = await db('orders')
      .where('id', orderId)
      .update({ 
        status: 'cancelled',
        updated_at: new Date()
      });

    if (result === 0) {
      throw new Error('Order not found');
    }

    return true;
  }
}

export default new OrderRepository();