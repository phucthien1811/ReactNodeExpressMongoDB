import db from '../config/knex.js';

class TrainerRepository {
  // Lấy tất cả trainers
  async findAll(filters = {}) {
    let query = db('trainers')
      .select(
        'trainers.id',
        'trainers.name',
        'trainers.email',
        'trainers.phone',
        'trainers.specialization as specializations',
        'trainers.bio',
        'trainers.certifications as certification',
        'trainers.experience_years',
        'trainers.hourly_rate',
        'trainers.avatar_url as avatar',
        'trainers.status'
      );
    
    if (filters.status) {
      query = query.where('trainers.status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('trainers.name', 'like', `%${filters.search}%`)
            .orWhere('trainers.email', 'like', `%${filters.search}%`)
            .orWhere('trainers.specialization', 'like', `%${filters.search}%`);
      });
    }
    
    return query.orderBy('trainers.created_at', 'desc');
  }

  // Lấy trainer theo ID
  async findById(id) {
    return db('trainers')
      .select(
        'trainers.id',
        'trainers.name',
        'trainers.email',
        'trainers.phone',
        'trainers.specialization as specializations',
        'trainers.bio',
        'trainers.certifications as certification',
        'trainers.experience_years',
        'trainers.hourly_rate',
        'trainers.avatar_url as avatar',
        'trainers.status'
      )
      .where('trainers.id', id)
      .first();
  }

  // Lấy trainer theo email
  async findByEmail(email) {
    return db('trainers').where('email', email).first();
  }

  // Tạo trainer mới
  async create(trainerData) {
    const [id] = await db('trainers').insert({
      ...trainerData,
      created_at: new Date(),
      updated_at: new Date()
    });
    return this.findById(id);
  }

  // Cập nhật trainer
  async update(id, trainerData) {
    await db('trainers').where('id', id).update({
      ...trainerData,
      updated_at: new Date()
    });
    return this.findById(id);
  }

  // Xóa trainer
  async delete(id) {
    return db('trainers').where('id', id).del();
  }

  // Cập nhật status trainer
  async updateStatus(id, status) {
    await db('trainers').where('id', id).update({
      status,
      updated_at: new Date()
    });
    return this.findById(id);
  }

  // Lấy thống kê trainers
  async getStats() {
    const totalResult = await db('trainers').count('* as total').first();
    const activeResult = await db('trainers').where('status', 'active').count('* as total').first();
    const inactiveResult = await db('trainers').where('status', 'inactive').count('* as total').first();
    
    return {
      total: parseInt(totalResult.total) || 0,
      active: parseInt(activeResult.total) || 0,
      inactive: parseInt(inactiveResult.total) || 0
    };
  }

  // Phân trang
  async findWithPagination({ page = 1, limit = 10, search = null, status = null } = {}) {
    const offset = (page - 1) * limit;
    
    let query = db('trainers')
      .select(
        'trainers.id',
        'trainers.name',
        'trainers.email',
        'trainers.phone',
        'trainers.specialization as specializations',
        'trainers.bio',
        'trainers.certifications as certification',
        'trainers.experience_years',
        'trainers.hourly_rate',
        'trainers.avatar_url as avatar',
        'trainers.status'
      );
    
    let countQuery = db('trainers');
    
    if (status) {
      query = query.where('status', status);
      countQuery = countQuery.where('status', status);
    }
    
    if (search) {
      const searchCondition = function() {
        this.where('name', 'like', `%${search}%`)
            .orWhere('email', 'like', `%${search}%`)
            .orWhere('specialization', 'like', `%${search}%`);
      };
      query = query.where(searchCondition);
      countQuery = countQuery.where(searchCondition);
    }
    
    const [{ total }] = await countQuery.count('* as total');
    const trainers = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    return {
      data: trainers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export default new TrainerRepository();
