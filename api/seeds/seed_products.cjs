/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('products').del();
  
  // Inserts seed entries
  await knex('products').insert([
    {
      code: 'SP001',
      name: 'Whey Protein Gold Standard',
      category: 'Thực phẩm bổ sung',
      description: 'Protein whey cao cấp từ Optimum Nutrition, hỗ trợ tăng cơ hiệu quả',
      price: 1850000,
      stock: 50,
      image_url: 'https://placehold.co/300x300/374151/FFFFFF?text=Whey',
      status: 'Còn hàng',
      visibility: 'Hiển thị'
    },
    {
      code: 'SP002',
      name: 'BCAA Xtend',
      category: 'Thực phẩm bổ sung',
      description: 'Axit amin thiết yếu hỗ trợ phục hồi cơ bắp sau tập luyện',
      price: 650000,
      stock: 120,
      image_url: 'https://placehold.co/300x300/374151/FFFFFF?text=BCAA',
      status: 'Còn hàng',
      visibility: 'Hiển thị'
    },
    {
      code: 'SP003',
      name: 'Găng tay tập gym',
      category: 'Phụ kiện',
      description: 'Găng tay chống trượt, bảo vệ bàn tay khi tập luyện với tạ',
      price: 250000,
      stock: 5,
      image_url: 'https://placehold.co/300x300/374151/FFFFFF?text=Glove',
      status: 'Sắp hết',
      visibility: 'Hiển thị'
    },
    {
      code: 'SP004',
      name: 'Creatine Monohydrate',
      category: 'Thực phẩm bổ sung',
      description: 'Tăng sức mạnh và độ bền trong tập luyện cường độ cao',
      price: 450000,
      stock: 0,
      image_url: 'https://placehold.co/300x300/374151/FFFFFF?text=Creatine',
      status: 'Hết hàng',
      visibility: 'Ẩn'
    },
    {
      code: 'SP005',
      name: 'Áo tank top gym',
      category: 'Trang phục',
      description: 'Áo tank top thoáng khí, co giãn tốt cho việc tập luyện',
      price: 350000,
      stock: 30,
      image_url: 'https://placehold.co/300x300/374151/FFFFFF?text=Tank',
      status: 'Còn hàng',
      visibility: 'Hiển thị'
    },
    {
      code: 'SP006',
      name: 'Máy tập tay kéo',
      category: 'Thiết bị',
      description: 'Thiết bị tập luyện cơ tay và vai tại nhà',
      price: 1200000,
      stock: 8,
      image_url: 'https://placehold.co/300x300/374151/FFFFFF?text=Pull',
      status: 'Còn hàng',
      visibility: 'Hiển thị'
    },
    {
      code: 'SP007',
      name: 'Pre-Workout C4',
      category: 'Thực phẩm bổ sung',
      description: 'Tăng năng lượng và tập trung trước buổi tập',
      price: 750000,
      stock: 45,
      image_url: 'https://placehold.co/300x300/374151/FFFFFF?text=PreWorkout',
      status: 'Còn hàng',
      visibility: 'Hiển thị'
    },
    {
      code: 'SP008',
      name: 'Quần short tập gym',
      category: 'Trang phục',
      description: 'Quần short co giãn 4 chiều, thoải mái khi vận động',
      price: 280000,
      stock: 60,
      image_url: 'https://placehold.co/300x300/374151/FFFFFF?text=Shorts',
      status: 'Còn hàng',
      visibility: 'Hiển thị'
    }
  ]);
};
