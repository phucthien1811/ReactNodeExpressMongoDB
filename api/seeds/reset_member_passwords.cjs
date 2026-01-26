const bcrypt = require('bcrypt');

/**
 * Reset password cho các tài khoản member test
 * Password mới: 123456
 */
exports.seed = async function(knex) {
  // Xóa tất cả member packages cũ nếu cần
  // await knex('member_packages').del();
  
  // Hash password mới
  const password = await bcrypt.hash('123456', 10);
  
  // Cập nhật password cho tất cả member có email chứa @gmail.com
  await knex('users')
    .where('email', 'like', 'member%@gmail.com')
    .update({
      password_hash: password,
      is_active: 1
    });

  console.log('✅ Reset password thành công cho các tài khoản member!');
  console.log('📧 Email: member1@gmail.com đến member14@gmail.com');
  console.log('🔑 Password: 123456');
};
