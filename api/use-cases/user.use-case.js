import bcrypt from 'bcrypt';
import userRepo from '../repositories/user.repo.js';

class UserService {
  // Lấy danh sách users
  async getAllUsers(filters) {
    return await userRepo.findAll(filters);
  }

  // Lấy user theo ID
  async getUserById(id) {
    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // Tạo user mới (dành cho admin)
  async createUser(userData) {
    const { email, password, name, role = 'member', phone } = userData;

    // Kiểm tra email đã tồn tại
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Validate password
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Tạo user
    const newUser = await userRepo.create({
      email,
      password_hash,
      name,
      role,
      phone: phone || null,
      is_active: true
    });

    return newUser;
  }

  // Cập nhật user
  async updateUser(id, userData) {
    const { email, password, name, role, phone } = userData;

    // Kiểm tra user tồn tại
    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Kiểm tra email nếu có thay đổi
    if (email && email !== user.email) {
      const existingUser = await userRepo.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    // Chuẩn bị data cập nhật
    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;

    // Hash password mới nếu có
    if (password && password.length >= 6) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await userRepo.update(id, updateData);
    return updatedUser;
  }

  // Xóa user
  async deleteUser(id) {
    // Kiểm tra user tồn tại
    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Không cho phép xóa admin
    if (user.role === 'admin') {
      throw new Error('Cannot delete admin user');
    }

    await userRepo.delete(id);
    return { message: 'User deleted successfully' };
  }

  // Toggle trạng thái active
  async toggleUserStatus(id) {
    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Không cho phép tắt admin
    if (user.role === 'admin') {
      throw new Error('Cannot deactivate admin user');
    }

    const updatedUser = await userRepo.toggleActive(id);
    return updatedUser;
  }

  // Lấy thống kê users
  async getUserStats() {
    const byRole = await userRepo.countByRole();
    const byStatus = await userRepo.countByStatus();

    // Đếm members mới trong tháng này
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newMembersThisMonth = await userRepo.countNewMembersThisMonth(startOfMonth);

    return {
      ...byRole,
      ...byStatus,
      totalMembers: byRole.member || 0,
      newMembersThisMonth
    };
  }
}

export default new UserService();
