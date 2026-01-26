import db from '../config/knex.js';

export const packageRepo = {
  // Helper function để parse JSON features
  parsePackageFeatures(pkg) {
    if (pkg && pkg.features) {
      try {
        pkg.features = typeof pkg.features === 'string' 
          ? JSON.parse(pkg.features) 
          : pkg.features;
      } catch (error) {
        console.error('Error parsing features:', error);
        pkg.features = [];
      }
    }
    return pkg;
  },

  // Lấy tất cả packages
  async findAll(filters = {}) {
    let query = db('packages').select('*');
    
    if (filters.isActive !== undefined) {
      query = query.where('is_active', filters.isActive);
    }
    
    if (filters.isPublished !== undefined) {
      query = query.where('is_published', filters.isPublished);
    }
    
    const packages = await query.orderBy('sort_order', 'asc').orderBy('created_at', 'desc');
    return packages.map(pkg => this.parsePackageFeatures(pkg));
  },

  // Lấy package theo ID
  async findById(id) {
    const pkg = await db('packages').where('id', id).first();
    return pkg ? this.parsePackageFeatures(pkg) : pkg;
  },

  // Tạo package mới
  async create(packageData) {
    const [id] = await db('packages').insert(packageData);
    return this.findById(id);
  },

  // Cập nhật package
  async update(id, packageData) {
    await db('packages').where('id', id).update({
      ...packageData,
      updated_at: new Date()
    });
    return this.findById(id);
  },

  // Xóa package
  async delete(id) {
    return db('packages').where('id', id).del();
  },

  // Lấy packages có thống kê số lượng member đã đăng ký
  async findAllWithStats() {
    const packages = await db('packages as p')
      .leftJoin('member_packages as mp', 'p.id', 'mp.package_id')
      .select(
        'p.*',
        db.raw('COUNT(DISTINCT mp.user_id) as total_members'), // Changed from member_id to user_id
        db.raw('COUNT(DISTINCT CASE WHEN mp.status = "active" THEN mp.user_id END) as active_members') // Changed from member_id to user_id
      )
      .groupBy('p.id')
      .orderBy('p.sort_order', 'asc');
    
    return packages.map(pkg => this.parsePackageFeatures(pkg));
  },

  // Lấy danh sách member đã đăng ký package
  async getPackageMembers(packageId, filters = {}) {
    let query = db('member_packages as mp')
      .join('users as u', 'mp.user_id', 'u.id')
      .join('packages as p', 'mp.package_id', 'p.id')
      .leftJoin('member_profiles as mpr', 'u.id', 'mpr.user_id')
      .where('mp.package_id', packageId)
      .select(
        'mp.id as member_package_id',
        'mp.user_id',
        'mp.package_id',
        'mp.start_date',
        'mp.end_date',
        'mp.status',
        'mp.paid_amount',
        'mp.notes',
        'mp.created_at',
        'u.name as full_name',
        'u.email',
        'mpr.phone',
        'p.name as package_name'
      );

    if (filters.status) {
      query = query.where('mp.status', filters.status);
    }

    return query.orderBy('mp.created_at', 'desc');
  }
};

export default packageRepo;