import productRepo from '../repositories/product.repo.js';

class ProductService {
  // Lấy danh sách products với phân trang và filter
  async getAllProducts(filters) {
    const products = await productRepo.findAll(filters);
    const total = await productRepo.count(filters);

    return {
      products,
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: Math.ceil(total / (filters.limit || 10))
      }
    };
  }

  // Lấy product theo ID
  async getProductById(id) {
    const product = await productRepo.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  // Tạo product mới
  async createProduct(productData) {
    const { code, name, category, price, stock } = productData;

    // Validate required fields
    if (!code || !name || !category) {
      throw new Error('Code, name, and category are required');
    }

    // Kiểm tra code đã tồn tại
    const existingProduct = await productRepo.findByCode(code);
    if (existingProduct) {
      throw new Error('Product code already exists');
    }

    // Validate price
    if (price && price < 0) {
      throw new Error('Price must be greater than or equal to 0');
    }

    // Validate stock
    if (stock && stock < 0) {
      throw new Error('Stock must be greater than or equal to 0');
    }

    // Tự động xác định status dựa trên stock
    let status = 'Còn hàng';
    if (stock === 0) {
      status = 'Hết hàng';
    } else if (stock <= 10) {
      status = 'Sắp hết';
    }

    const newProduct = await productRepo.create({
      ...productData,
      status: status,
      visibility: productData.visibility || 'Hiển thị'
    });

    return newProduct;
  }

  // Cập nhật product
  async updateProduct(id, productData) {
    // Kiểm tra product tồn tại
    const product = await productRepo.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Kiểm tra code nếu có thay đổi
    if (productData.code && productData.code !== product.code) {
      const existingProduct = await productRepo.findByCode(productData.code);
      if (existingProduct) {
        throw new Error('Product code already exists');
      }
    }

    // Validate price
    if (productData.price !== undefined && productData.price < 0) {
      throw new Error('Price must be greater than or equal to 0');
    }

    // Validate stock và cập nhật status
    if (productData.stock !== undefined) {
      if (productData.stock < 0) {
        throw new Error('Stock must be greater than or equal to 0');
      }

      // Tự động cập nhật status
      if (productData.stock === 0) {
        productData.status = 'Hết hàng';
      } else if (productData.stock <= 10) {
        productData.status = 'Sắp hết';
      } else {
        productData.status = 'Còn hàng';
      }
    }

    const updatedProduct = await productRepo.update(id, productData);
    return updatedProduct;
  }

  // Xóa product
  async deleteProduct(id) {
    // Kiểm tra product tồn tại
    const product = await productRepo.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    await productRepo.delete(id);
    return { message: 'Product deleted successfully' };
  }

  // Lấy danh sách categories
  async getCategories() {
    return await productRepo.getCategories();
  }

  // Cập nhật stock
  async updateStock(id, quantity) {
    const product = await productRepo.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    await productRepo.updateStock(id, quantity);
    
    // Cập nhật status dựa trên stock mới
    const updatedProduct = await productRepo.findById(id);
    let status = 'Còn hàng';
    
    if (updatedProduct.stock === 0) {
      status = 'Hết hàng';
    } else if (updatedProduct.stock <= 10) {
      status = 'Sắp hết';
    }

    return await productRepo.update(id, { status });
  }

  // Giảm stock (khi bán hàng)
  async decreaseStock(id, quantity) {
    return await productRepo.decreaseStock(id, quantity);
  }

  // Toggle visibility
  async toggleVisibility(id) {
    const product = await productRepo.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const newVisibility = product.visibility === 'Hiển thị' ? 'Ẩn' : 'Hiển thị';
    return await productRepo.update(id, { visibility: newVisibility });
  }
}

export default new ProductService();
