import knex from '../config/knex.js';

class ScheduleRepository {
  async create(scheduleData) {
    const [id] = await knex('schedules').insert(scheduleData);
    return this.findById(id);
  }

  async findAll(filters = {}) {
    // Tự động cập nhật status cho các lớp đã qua (chạy async, không chờ)
    knex('schedules')
      .where('status', '!=', 'completed')
      .where('status', '!=', 'cancelled')
      .whereRaw('CONCAT(class_date, " ", end_time) < NOW()')
      .update({ status: 'completed' })
      .catch(err => console.error('Auto-update status error:', err));

    const query = knex('schedules')
      .leftJoin('trainers', 'schedules.trainer_id', 'trainers.id')
      .select(
        'schedules.*',
        'trainers.name as trainer_name',
        'trainers.email as trainer_email',
        knex.raw('(SELECT COUNT(*) FROM class_enrollments WHERE class_enrollments.schedule_id = schedules.id) as current_participants')
      );

    // Filter theo status
    if (filters.status) {
      query.where('schedules.status', filters.status);
    } else if (!filters.show_completed) {
      // Mặc định ẩn các lớp completed
      query.whereNot('schedules.status', 'completed');
    }

    if (filters.class_name) {
      query.where('schedules.class_name', 'like', `%${filters.class_name}%`);
    }

    if (filters.trainer_id) {
      query.where('schedules.trainer_id', filters.trainer_id);
    }

    if (filters.start_date) {
      query.where('schedules.class_date', '>=', filters.start_date);
    }

    if (filters.end_date) {
      query.where('schedules.class_date', '<=', filters.end_date);
    }

    query.orderBy('schedules.class_date', 'desc')
         .orderBy('schedules.start_time', 'asc');

    const schedules = await query;
    
    // Add enrollment status for each schedule if user_id is provided
    if (filters.user_id) {
      for (let schedule of schedules) {
        const enrollment = await knex('class_enrollments')
          .where({ schedule_id: schedule.id, user_id: filters.user_id })
          .first();
        schedule.is_enrolled = !!enrollment;
      }
    }

    return schedules;
  }

  async findById(id) {
    const schedule = await knex('schedules')
      .leftJoin('trainers', 'schedules.trainer_id', 'trainers.id')
      .select(
        'schedules.*',
        'trainers.name as trainer_name',
        'trainers.email as trainer_email'
      )
      .where('schedules.id', id)
      .first();

    if (schedule) {
      // Get enrolled participants
      const enrollments = await knex('class_enrollments')
        .join('users', 'class_enrollments.user_id', 'users.id')
        .select(
          'users.id', 
          'users.name', 
          'users.email',
          'class_enrollments.enrolled_at',
          'class_enrollments.status'
        )
        .where('class_enrollments.schedule_id', id);

      schedule.enrollments = enrollments; // Đổi từ participants thành enrollments
      schedule.participants = enrollments; // Giữ lại để backward compatibility
      schedule.current_participants = enrollments.length;
    }

    return schedule;
  }

  async update(id, scheduleData) {
    await knex('schedules').where('id', id).update(scheduleData);
    return this.findById(id);
  }

  async delete(id) {
    // First delete all enrollments
    await knex('class_enrollments').where('schedule_id', id).del();
    // Then delete the schedule
    return await knex('schedules').where('id', id).del();
  }

  async enrollUser(scheduleId, userId) {
    // Check if schedule exists and has space
    const schedule = await this.findById(scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    if (schedule.current_participants >= schedule.max_participants) {
      throw new Error('Class is full');
    }

    // Check if user is already enrolled
    const existingEnrollment = await knex('class_enrollments')
      .where({ schedule_id: scheduleId, user_id: userId })
      .first();

    if (existingEnrollment) {
      throw new Error('Bạn đã đăng ký lớp học này rồi. Nếu admin đã thêm bạn vào lớp, bạn không cần đăng ký lại.');
    }

    // Enroll user
    await knex('class_enrollments').insert({
      schedule_id: scheduleId,
      user_id: userId,
      enrolled_at: new Date()
    });

    return this.findById(scheduleId);
  }

  async unenrollUser(scheduleId, userId) {
    await knex('class_enrollments')
      .where({ schedule_id: scheduleId, user_id: userId })
      .del();

    return this.findById(scheduleId);
  }

  async getEnrollments(scheduleId) {
    return await knex('class_enrollments')
      .join('users', 'class_enrollments.user_id', 'users.id')
      .select(
        'class_enrollments.*',
        'users.name',
        'users.email'
      )
      .where('class_enrollments.schedule_id', scheduleId);
  }

  async getSchedulesByTrainer(trainerId) {
    return await knex('schedules')
      .leftJoin('trainers', 'schedules.trainer_id', 'trainers.id')
      .select(
        'schedules.*',
        'trainers.name as trainer_name',
        'trainers.email as trainer_email'
      )
      .where('schedules.trainer_id', trainerId)
      .orderBy('schedules.start_time', 'asc');
  }

  async getSchedulesByDateRange(startDate, endDate) {
    return await knex('schedules')
      .leftJoin('trainers', 'schedules.trainer_id', 'trainers.id')
      .select(
        'schedules.*',
        'trainers.name as trainer_name',
        'trainers.email as trainer_email'
      )
      .whereBetween('schedules.start_time', [startDate, endDate])
      .orderBy('schedules.start_time', 'asc');
  }

  async removeEnrollment(scheduleId, userId) {
    return await knex('class_enrollments')
      .where({ schedule_id: scheduleId, user_id: userId })
      .del();
  }

  async updateCurrentParticipants(scheduleId) {
    const count = await knex('class_enrollments')
      .where('schedule_id', scheduleId)
      .count('* as total')
      .first();
    
    return await knex('schedules')
      .where('id', scheduleId)
      .update({ current_participants: count.total });
  }

  async getEnrollments(scheduleId) {
    return await knex('class_enrollments')
      .join('users', 'class_enrollments.user_id', 'users.id')
      .select(
        'users.id', 
        'users.name', 
        'users.email',
        'class_enrollments.enrolled_at',
        'class_enrollments.status'
      )
      .where('class_enrollments.schedule_id', scheduleId);
  }
}

export default new ScheduleRepository();
