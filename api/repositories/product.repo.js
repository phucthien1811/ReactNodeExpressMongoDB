import db from '../config/knex.js';

class ProductRepository {
  // Lấy tất cả products với filter
  async findAll(filters = {}) {
    let query = db('products');

    // Filter theo category
    if (filters.category) {
      query = query.where('category', filters.category);
    }

    // Filter theo visibility
    if (filters.visibility) {
      query = query.where('visibility', filters.visibility);
    }

    // Filter theo status
    if (filters.status) {
      query = query.where('status', filters.status);
    }

    // Search theo name hoặc code
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'like', `%${filters.search}%`)
            .orWhere('code', 'like', `%${filters.search}%`)
            .orWhere('description', 'like', `%${filters.search}%`);
      });
    }

    // Pagination
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query = query.limit(filters.limit).offset(offset);
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at';
    const order = filters.order || 'desc';
    query = query.orderBy(sortBy, order);

    return await query;
  }

  // Đếm tổng số products
  async count(filters = {}) {
    let query = db('products');

    if (filters.category) {
      query = query.where('category', filters.category);
    }

    if (filters.visibility) {
      query = query.where('visibility', filters.visibility);
    }

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'like', `%${filters.search}%`)
            .orWhere('code', 'like', `%${filters.search}%`)
            .orWhere('description', 'like', `%${filters.search}%`);
      });
    }

    const result = await query.count('* as count').first();
    return result.count;
  }

  // Lấy product theo ID
  async findById(id) {
    return await db('products').where('id', id).first();
  }

  // Lấy product theo code
  async findByCode(code) {
    return await db('products').where('code', code).first();
  }

  // Tạo product mới
  async create(productData) {
    const [id] = await db('products').insert(productData);
    return await this.findById(id);
  }

  // Cập nhật product
  async update(id, productData) {
    await db('products').where('id', id).update(productData);
    return await this.findById(id);
  }

  // Xóa product
  async delete(id) {
    return await db('products').where('id', id).delete();
  }

  // Lấy danh sách categories
  async getCategories() {
    const result = await db('products')
      .distinct('category')
      .orderBy('category');
    return result.map(r => r.category);
  }

  // Cập nhật stock
  async updateStock(id, quantity) {
    return await db('products')
      .where('id', id)
      .increment('stock', quantity);
  }

  // Giảm stock (khi bán)
  async decreaseStock(id, quantity) {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    const newStock = product.stock - quantity;
    let status = 'Còn hàng';
    
    if (newStock === 0) {
      status = 'Hết hàng';
    } else if (newStock <= 10) {
      status = 'Sắp hết';
    }

    await db('products')
      .where('id', id)
      .update({ 
        stock: newStock,
        status: status 
      });

    return await this.findById(id);
  }

  // Thống kê sản phẩm
  async getProductStats() {
    // Tổng số sản phẩm
    const totalProducts = await db('products').count('* as count').first();

    // Sản phẩm sắp hết (stock <= 10 và > 0)
    const lowStockProducts = await db('products')
      .where('stock', '>', 0)
      .where('stock', '<=', 10)
      .select('id', 'code', 'name', 'stock', 'category');

    // Sản phẩm hết hàng (stock = 0)
    const outOfStockProducts = await db('products')
      .where('stock', 0)
      .count('* as count')
      .first();

    // Sản phẩm theo danh mục
    const productsByCategory = await db('products')
      .select('category')
      .count('* as count')
      .groupBy('category');

    return {
      totalProducts: parseInt(totalProducts.count || 0),
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts,
      outOfStockCount: parseInt(outOfStockProducts.count || 0),
      productsByCategory: productsByCategory
    };
  }
}

export default new ProductRepository();
