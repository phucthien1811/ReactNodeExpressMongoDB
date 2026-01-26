import db from '../config/knex.js';

class UserRepository {
  async findAll({ page = 1, limit = 10, search = '', status = '' }) {
    const offset = (page - 1) * limit;
    
    let query = db('users')
      .select(
        'users.id',
        'users.email',
        'users.name',
        'users.role',
        'users.is_active',
        'users.phone',
        'users.avatar_url',
        'users.created_at',
        'users.updated_at'
      )
      .where('users.role', '=', 'member'); 

    // Filter theo search
    if (search) {
      query = query.where(function() {
        this.where('users.name', 'like', `%${search}%`)
          .orWhere('users.email', 'like', `%${search}%`)
          .orWhere('users.id', 'like', `%${search}%`);
      });
    }

    // Filter theo status
    if (status === 'active') {
      query = query.where('users.is_active', true);
    } else if (status === 'inactive') {
      query = query.where('users.is_active', false);
    }

    // Đếm tổng số
    const countQuery = query.clone();
    const [{ total }] = await countQuery.count('* as total');

    // Lấy data với phân trang
    const users = await query
      .orderBy('users.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Lấy user theo ID
  async findById(id) {
    return await db('users')
      .select(
        'id',
        'email',
        'name',
        'role',
        'is_active',
        'phone',
        'avatar_url',
        'created_at',
        'updated_at'
      )
      .where({ id })
      .first();
  }

  // Lấy user theo email
  async findByEmail(email) {
    return await db('users')
      .where({ email })
      .first();
  }

  // Tạo user mới
  async create(userData) {
    const [id] = await db('users').insert(userData);
    return await this.findById(id);
  }

  // Cập nhật user
  async update(id, userData) {
    await db('users')
      .where({ id })
      .update({
        ...userData,
        updated_at: db.fn.now()
      });
    return await this.findById(id);
  }

  // Xóa user
  async delete(id) {
    return await db('users').where({ id }).del();
  }

  // Toggle trạng thái active
  async toggleActive(id) {
    const user = await db('users').where({ id }).first();
    if (!user) return null;

    const newStatus = !user.is_active;
    await db('users')
      .where({ id })
      .update({
        is_active: newStatus,
        updated_at: db.fn.now()
      });

    return await this.findById(id);
  }

  // Đếm số lượng user theo role
  async countByRole() {
    const counts = await db('users')
      .select('role')
      .count('* as count')
      .groupBy('role');

    return counts.reduce((acc, { role, count }) => {
      acc[role] = parseInt(count);
      return acc;
    }, {});
  }

  // Đếm user active/inactive (chỉ members)
  async countByStatus() {
    const [active] = await db('users')
      .where({ is_active: true, role: 'member' })
      .count('* as count');
    
    const [inactive] = await db('users')
      .where({ is_active: false, role: 'member' })
      .count('* as count');

    return {
      active: parseInt(active.count),
      inactive: parseInt(inactive.count),
      total: parseInt(active.count) + parseInt(inactive.count)
    };
  }

  // Đếm số lượng members mới trong tháng
  async countNewMembersThisMonth(startOfMonth) {
    const [result] = await db('users')
      .where('role', 'member')
      .where('created_at', '>=', startOfMonth)
      .count('* as count');
    
    return parseInt(result.count);
  }

  // Lấy danh sách members mới gần đây
  async getRecentMembers(limit = 5) {
    const members = await db('users')
      .leftJoin('member_packages', function() {
        this.on('users.id', '=', 'member_packages.user_id')
            .andOn('member_packages.status', '=', db.raw('?', ['active']));
      })
      .leftJoin('packages', 'member_packages.package_id', 'packages.id')
      .select(
        'users.id',
        'users.name',
        'users.email',
        'users.created_at',
        'packages.name as package_name',
        'member_packages.status as membership_status'
      )
      .where('users.role', 'member')
      .orderBy('users.created_at', 'desc')
      .limit(limit);

    return members;
  }

  // Lấy số lượng members mới theo 6 tháng gần nhất
  async getNewMembersLast6Months() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // 6 tháng bao gồm tháng hiện tại
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const results = await db('users')
      .select(
        db.raw('YEAR(created_at) as year'),
        db.raw('MONTH(created_at) as month'),
        db.raw('COUNT(*) as count')
      )
      .where('role', 'member')
      .where('created_at', '>=', sixMonthsAgo)
      .groupByRaw('YEAR(created_at), MONTH(created_at)')
      .orderByRaw('YEAR(created_at), MONTH(created_at)');

    console.log('📊 New Members Last 6 Months:', results);
    return results;
  }

  // Đếm phân bổ gói tập (VIP, BASIC, PREMIUM)
  async getPackageDistribution() {
    const results = await db('packages')
      .leftJoin('member_packages', function() {
        this.on('packages.id', '=', 'member_packages.package_id')
            .andOn('member_packages.status', '=', db.raw('?', ['active']));
      })
      .select(
        'packages.name',
        db.raw('COUNT(member_packages.id) as count')
      )
      .groupBy('packages.id', 'packages.name')
      .orderBy('count', 'desc');

    console.log('📊 Package Distribution:', results);
    return results;
  }
}

export default new UserRepository();
