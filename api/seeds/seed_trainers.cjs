/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('trainers').del();
  
  // Inserts seed entries
  await knex('trainers').insert([
    {
      id: 1,
      name: 'Dũng Nguyễn',
      email: 'dung.nguyen@royal.fit',
      phone: '0901234567',
      specialization: 'Bodybuilding, Strength Training',
      bio: 'Huấn luyện viên với 8 năm kinh nghiệm trong lĩnh vực bodybuilding và tăng cơ. Từng đạt giải 3 cuộc thi Mr. Vietnam 2020.',
      avatar_url: null,
      experience_years: 8,
      certifications: 'NASM-CPT, ACSM Certified',
      hourly_rate: 500000.00,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Anna Trần',
      email: 'anna.tran@royal.fit',
      phone: '0907654321',
      specialization: 'Yoga, Pilates, Flexibility',
      bio: 'Chuyên gia yoga với hơn 5 năm kinh nghiệm. Được đào tạo chính thức tại Ấn Độ và có chứng chỉ quốc tế.',
      avatar_url: null,
      experience_years: 5,
      certifications: 'RYT-500, Pilates Mat Certified',
      hourly_rate: 400000.00,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Mike Phạm',
      email: 'mike.pham@royal.fit',
      phone: '0912345678',
      specialization: 'Boxing, MMA, Combat Sports',
      bio: 'Cựu võ sĩ boxing chuyên nghiệp, hiện là huấn luyện viên boxing và các môn võ thuật.',
      avatar_url: null,
      experience_years: 6,
      certifications: 'Boxing Coach Level 2, MMA Instructor',
      hourly_rate: 600000.00,
      status: 'inactive',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};