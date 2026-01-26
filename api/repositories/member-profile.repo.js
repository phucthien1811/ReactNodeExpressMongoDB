import { db } from '../config/database.js';

class MemberProfileRepository {
  // Lấy profile của user
  async getProfileByUserId(userId) {
    const [profiles] = await db.execute(`
      SELECT 
        mp.*, 
        u.name, 
        u.email, 
        u.role,
        p.name as membership_plan,
        mpkg.start_date as membership_start_date,
        mpkg.end_date as membership_end_date,
        mpkg.status as membership_status
      FROM users u
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      LEFT JOIN member_packages mpkg ON u.id = mpkg.user_id AND mpkg.status = 'active'
      LEFT JOIN packages p ON mpkg.package_id = p.id
      WHERE u.id = ?
    `, [userId]);
    
    const profile = profiles[0];
    
    // If no profile exists in member_profiles table, create a blank one
    if (profile && profile.user_id === null) {
      console.log('📝 Creating initial profile for user:', userId);
      await db.execute(`
        INSERT INTO member_profiles (user_id, created_at, updated_at)
        VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [userId]);
      
      // Re-fetch with the new profile
      const [newProfiles] = await db.execute(`
        SELECT 
          mp.*, 
          u.name, 
          u.email, 
          u.role,
          p.name as membership_plan,
          mpkg.start_date as membership_start_date,
          mpkg.end_date as membership_end_date,
          mpkg.status as membership_status
        FROM users u
        LEFT JOIN member_profiles mp ON u.id = mp.user_id
        LEFT JOIN member_packages mpkg ON u.id = mpkg.user_id AND mpkg.status = 'active'
        LEFT JOIN packages p ON mpkg.package_id = p.id
        WHERE u.id = ?
      `, [userId]);
      
      return newProfiles[0];
    }
    
    return profile || null;
  }

  // Tạo profile mới
  async createProfile(userId, profileData) {
    const {
      phone, birth_date, gender, address, avatar_url,
      height, weight, fitness_goals, activity_level,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
      medical_conditions, allergies
    } = profileData;

    // Calculate BMI if height and weight provided
    let bmi = null;
    if (height && weight) {
      bmi = (weight / Math.pow(height / 100, 2)).toFixed(2);
    }

    const [result] = await db.execute(`
      INSERT INTO member_profiles (
        user_id, phone, birth_date, gender, address, avatar_url,
        height, weight, bmi, fitness_goals, activity_level,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        medical_conditions, allergies
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, phone, birth_date, gender, address, avatar_url,
      height, weight, bmi, fitness_goals, activity_level,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
      medical_conditions, allergies
    ]);

    return this.getProfileByUserId(userId);
  }

  // Cập nhật profile
  async updateProfile(userId, profileData) {
    console.log('🔍 Repository updateProfile called with:', { userId, profileData });
    
    // Clean data - only include fields that exist in member_profiles table
    const updateData = {};
    const validFields = [
      'phone', 'birth_date', 'gender', 'address', 'avatar_url',
      'height', 'weight', 'fitness_goals', 'activity_level',
      'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
      'medical_conditions', 'allergies'
    ];
    
    validFields.forEach(field => {
      // Chỉ thêm field nếu có giá trị thực sự (không phải undefined, null, hoặc empty string)
      let value = profileData[field];
      
      // Handle array values (FormData sometimes creates arrays)
      if (Array.isArray(value)) {
        value = value[0]; // Take first element if array
      }
      
      if (value !== undefined && value !== null && value !== '') {
        updateData[field] = value;
      }
    });
    
    // If avatar_url is being updated, also update it in the users table
    if (updateData.avatar_url) {
      await db.execute(
        'UPDATE users SET avatar_url = ? WHERE id = ?',
        [updateData.avatar_url, userId]
      );
      console.log('✅ Updated avatar_url in users table');
    }
    
    // Handle phone_number mapping (frontend sends phone_number, DB uses phone)
    if (profileData.phone_number) {
      let phoneValue = profileData.phone_number;
      // Handle array case
      if (Array.isArray(phoneValue)) {
        phoneValue = phoneValue[0];
      }
      if (phoneValue && phoneValue !== '') {
        updateData.phone = phoneValue;
      }
    }
    
    // Handle fitness_goal vs fitness_goals mapping
    if (profileData.fitness_goal && profileData.fitness_goal !== '') {
      updateData.fitness_goals = profileData.fitness_goal;
    }
    
    // Calculate BMI if height and weight provided
    if (updateData.height && updateData.weight) {
      const height = parseFloat(updateData.height);
      const weight = parseFloat(updateData.weight);
      if (!isNaN(height) && !isNaN(weight) && height > 0 && weight > 0) {
        updateData.bmi = (weight / Math.pow(height / 100, 2)).toFixed(2);
        updateData.height = height;
        updateData.weight = weight;
      } else {
        // Remove invalid height/weight
        delete updateData.height;
        delete updateData.weight;
      }
    }
    
    console.log('📊 Final update data for member_profiles:', updateData);
    
    // Update member_profiles table only if there are valid fields to update
    if (Object.keys(updateData).length > 0) {
      const fields = Object.keys(updateData);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateData[field]);
      
      const query = `
        UPDATE member_profiles SET
        ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;
      
      console.log('🔧 Executing query:', query);
      console.log('🔧 With values:', [...values, userId]);
      
      try {
        await db.execute(query, [...values, userId]);
      } catch (error) {
        console.error('❌ Error executing update query:', error);
        throw error;
      }
    } else {
      console.log('⚠️ No valid fields to update in member_profiles');
    }
    
    // Update full_name in users table if provided
    if (profileData.full_name && profileData.full_name.trim() !== '') {
      console.log('📝 Updating full_name in users table:', profileData.full_name);
      await db.execute(`
        UPDATE users SET name = ? WHERE id = ?
      `, [profileData.full_name.trim(), userId]);
    }

    return this.getProfileByUserId(userId);
  }

  // Cập nhật thông tin membership
  async updateMembershipInfo(userId, membershipData) {
    const { membership_status, membership_start_date, membership_end_date, membership_type } = membershipData;

    await db.execute(`
      UPDATE member_profiles SET
        membership_status = ?, membership_start_date = ?, 
        membership_end_date = ?, membership_type = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [membership_status, membership_start_date, membership_end_date, membership_type, userId]);

    return this.getProfileByUserId(userId);
  }

  // Lấy tất cả profiles (cho admin)
  async getAllProfiles({ page = 1, limit = 10, search = null, role = null } = {}) {
    let query = `
      SELECT mp.*, u.name, u.email, u.role 
      FROM member_profiles mp
      JOIN users u ON mp.user_id = u.id
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM member_profiles mp
      JOIN users u ON mp.user_id = u.id
    `;
    
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR mp.phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      conditions.push('u.role = ?');
      params.push(role);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY mp.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const [profiles] = await db.execute(query, params);
    const [countResult] = await db.execute(countQuery, params.slice(0, -2)); // Remove limit and offset for count

    return {
      profiles,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  // Xóa profile (soft delete - chỉ set status)
  async deleteProfile(userId) {
    await db.execute(`
      UPDATE member_profiles SET
        membership_status = 'deleted',
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [userId]);

    return true;
  }
}

export default new MemberProfileRepository();