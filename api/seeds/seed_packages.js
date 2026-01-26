/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export const seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('packages').del();

  // Inserts seed entries
  await knex('packages').insert([
    {
      id: 1,
      name: 'Basic',
      description: 'Gói tập cơ bản phù hợp cho người mới bắt đầu',
      price: 450000,
      duration_days: 30, // 1 tháng
      features: JSON.stringify([
        'Sử dụng phòng tạ',
        'Sử dụng phòng cardio',
        'Tủ đồ cá nhân',
        'Hỗ trợ từ nhân viên'
      ]),
      is_active: true,
      is_published: true,
      sort_order: 1
    },
    {
      id: 2,
      name: 'Pro',
      description: 'Gói tập nâng cao với nhiều tiện ích',
      price: 1200000,
      duration_days: 90, // 3 tháng
      features: JSON.stringify([
        'Tất cả quyền lợi gói Basic',
        'Tham gia lớp Yoga',
        'Tham gia lớp Group X',
        'Sử dụng phòng xông hơi',
        '1 buổi PT miễn phí/tháng'
      ]),
      is_active: true,
      is_published: true,
      sort_order: 2
    },
    {
      id: 3,
      name: 'Premium',
      description: 'Gói tập cao cấp với đầy đủ tiện ích',
      price: 4000000,
      duration_days: 365, // 12 tháng
      features: JSON.stringify([
        'Tất cả quyền lợi gói Pro',
        '4 buổi PT miễn phí/tháng',
        'Đo InBody hàng tháng',
        'Tư vấn chế độ dinh dưỡng',
        'Ưu tiên đăng ký lớp học',
        'Miễn phí nước uống'
      ]),
      is_active: true,
      is_published: true,
      sort_order: 3
    },
    {
      id: 4,
      name: 'VIP',
      description: 'Gói tập VIP dành cho khách hàng đặc biệt',
      price: 8000000,
      duration_days: 365, // 12 tháng
      features: JSON.stringify([
        'Tất cả quyền lợi gói Premium',
        'PT riêng không giới hạn',
        'Phòng tập riêng VIP',
        'Massage thể thao 2 lần/tháng',
        'Đưa đón miễn phí',
        'Suất ăn dinh dưỡng'
      ]),
      is_active: true,
      is_published: false, // Chưa public
      sort_order: 4
    }
  ]);
};