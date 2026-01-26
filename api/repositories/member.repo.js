import db from '../config/knex.js';

export const memberRepo = {
  // Tìm member theo ID
  async findById(id) {
    return db('members').where('id', id).first();
  },

  // Tìm member theo email
  async findByEmail(email) {
    return db('members').where('email', email).first();
  },

  // Lấy tất cả members
  async findAll(filters = {}) {
    let query = db('members').select('*');
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('full_name', 'like', `%${filters.search}%`)
            .orWhere('email', 'like', `%${filters.search}%`)
            .orWhere('phone', 'like', `%${filters.search}%`);
      });
    }
    
    return query.orderBy('created_at', 'desc');
  },

  // Tạo member mới
  async create(memberData) {
    const [id] = await db('members').insert(memberData);
    return this.findById(id);
  },

  // Cập nhật member
  async update(id, memberData) {
    await db('members').where('id', id).update({
      ...memberData,
      updated_at: new Date()
    });
    return this.findById(id);
  },

  // Xóa member
  async delete(id) {
    return db('members').where('id', id).del();
  },

  // Thống kê
  async statCounts() {
    const [result] = await db('members')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('COUNT(CASE WHEN status = "active" THEN 1 END) as active'),
        db.raw('COUNT(CASE WHEN status = "inactive" THEN 1 END) as inactive')
      );
    return result;
  }
};

export default memberRepo;