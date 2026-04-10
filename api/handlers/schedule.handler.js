import { scheduleService } from "../use-cases/schedule.use-case.js";
import scheduleRepo from "../repositories/schedule.repo.js";
import knex from '../config/knex.js';
import { exportToExcel, presetStyles } from '../utils/excelExporter.js';

export const listSchedules = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, trainer_id, from, to, status, class_name, show_completed } = req.query;
    
    console.log('📋 List schedules filters:', { 
      show_completed, 
      status, 
      class_name, 
      trainer_id 
    });
    
    const filters = {
      page: Number(page), 
      limit: Number(limit),
      trainer_id: trainer_id ? Number(trainer_id) : null,
      from: from || null, 
      to: to || null, 
      status: status || null,
      class_name: class_name || null,
      show_completed: show_completed === 'true', // Thêm filter này
      user_id: req.user?.id || null // Add user_id để check enrollment status
    };
    
    const [rows, c] = await Promise.all([
      scheduleService.list(filters),
      scheduleService.count(filters),
    ]);
    
    console.log('📊 Found schedules:', rows.length);
    
    res.json({ 
      success: true,
      data: rows, 
      total: Number(c?.total || 0),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(Number(c?.total || 0) / Number(limit))
      }
    });
  } catch (e) { 
    console.error('❌ List schedules error:', e);
    next(e); 
  }
};

export const getSchedule = async (req, res, next) => {
  try {
    const schedule = await scheduleService.byId(req.params.id);
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Lịch học không tồn tại" 
      });
    }
    
    // Lấy danh sách học viên đăng ký
    const enrollments = await scheduleRepo.getEnrollments(req.params.id);
    
    res.json({ 
      success: true,
      data: {
        ...schedule,
        enrollments
      }
    });
  } catch (e) { 
    next(e); 
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const scheduleData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const schedule = await scheduleRepo.create(scheduleData);
    
    res.status(201).json({ 
      success: true,
      message: "Tạo lịch học thành công",
      data: schedule 
    });
  } catch (e) { 
    next(e); 
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    const schedule = await scheduleRepo.update(scheduleId, updateData);
    
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Lịch học không tồn tại" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Cập nhật lịch học thành công",
      data: schedule 
    });
  } catch (e) { 
    next(e); 
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    
    // Kiểm tra xem lịch học có tồn tại không
    const schedule = await scheduleService.byId(scheduleId);
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Lịch học không tồn tại" 
      });
    }
    
    // Kiểm tra xem có học viên đăng ký không
    const enrollments = await scheduleRepo.getEnrollments(scheduleId);
    if (enrollments.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Không thể xóa lịch học đã có học viên đăng ký" 
      });
    }
    
    await scheduleService.remove(scheduleId);
    res.json({ 
      success: true,
      message: "Xóa lịch học thành công"
    });
  } catch (e) { 
    next(e); 
  }
};

// Thêm các function mới cho quản lý enrollment
export const enrollStudent = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const { userId } = req.body;
    
    console.log(`👨‍💼 Admin ${req.user?.id} adding user ${userId} to class ${scheduleId}`);
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Vui lòng chọn học viên" 
      });
    }
    
    // Kiểm tra lịch học có tồn tại
    const schedule = await scheduleService.byId(scheduleId);
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Lịch học không tồn tại" 
      });
    }
    
    // Kiểm tra số lượng học viên
    if (schedule.current_participants >= schedule.max_participants) {
      return res.status(400).json({ 
        success: false, 
        message: "Lớp học đã đầy" 
      });
    }
    
    await scheduleRepo.enrollUser(scheduleId, userId);
    await scheduleRepo.updateCurrentParticipants(scheduleId);
    
    console.log(`✅ Admin added user ${userId} to class ${scheduleId} successfully`);
    
    res.json({ 
      success: true,
      message: "Đăng ký học viên thành công"
    });
  } catch (e) {
    console.error('❌ Error in enrollStudent:', e);
    
    if (e.code === 'ER_DUP_ENTRY' || e.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ 
        success: false, 
        message: "Học viên đã đăng ký lớp học này" 
      });
    }
    
    // Handle custom error messages
    if (e.message && e.message.includes('đã đăng ký')) {
      return res.status(400).json({ 
        success: false, 
        message: "Học viên đã đăng ký lớp học này" 
      });
    }
    
    next(e); 
  }
};

export const removeEnrollment = async (req, res, next) => {
  try {
    const { scheduleId, userId } = req.params;
    
    await scheduleRepo.removeEnrollment(scheduleId, userId);
    await scheduleRepo.updateCurrentParticipants(scheduleId);
    
    res.json({ 
      success: true,
      message: "Hủy đăng ký thành công"
    });
  } catch (e) { 
    next(e); 
  }
};

// Get user's enrollments
export const getMyEnrollments = async (req, res, next) => {
  try {
    console.log('🔄 getMyEnrollments called for user:', req.user?.id);
    
    const userId = req.user.id; // From auth middleware
    
    const enrollments = await knex('class_enrollments')
      .join('schedules', 'class_enrollments.schedule_id', 'schedules.id')
      .leftJoin('trainers', 'schedules.trainer_id', 'trainers.id')
      .select(
        'class_enrollments.id as enrollment_id',
        'schedules.id as schedule_id',
        'schedules.class_name',
        'schedules.start_time',
        'schedules.end_time',
        'schedules.class_date',
        'schedules.room',
        'schedules.location',
        'schedules.floor', // Thêm trường floor
        'trainers.name as trainer_name'
      )
      .where('class_enrollments.user_id', userId)
      .where('schedules.status', 'scheduled')
      .orderBy('schedules.class_date', 'asc')
      .orderBy('schedules.start_time', 'asc');

    console.log('📊 Found enrollments:', enrollments.length);
    console.log('📝 Enrollments data:', enrollments);

    res.json(enrollments);
  } catch (error) {
    console.error('💥 Error getting my enrollments:', error);
    res.status(500).json({ message: 'Error retrieving enrollments', error: error.message });
  }
};

// User enroll in class
export const userEnrollClass = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    console.log(`🎓 User ${userId} trying to enroll in class ${scheduleId}`);
    
    const result = await scheduleRepo.enrollUser(scheduleId, userId);
    
    console.log(`✅ User ${userId} enrolled successfully in class ${scheduleId}`);
    
    res.json({ 
      success: true,
      message: 'Đăng ký lớp học thành công', 
      data: result 
    });
  } catch (error) {
    console.error('❌ Error enrolling user:', error);
    
    // Check for specific error messages
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy lớp học' 
      });
    }
    
    if (error.message.includes('full')) {
      return res.status(400).json({ 
        success: false,
        message: 'Lớp học đã đầy' 
      });
    }
    
    if (error.message.includes('already enrolled') || error.message.includes('đã đăng ký')) {
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
    
    // Generic error
    return res.status(500).json({ 
      success: false,
      message: 'Có lỗi xảy ra khi đăng ký lớp học', 
      error: error.message 
    });
  }
};

// User unenroll from class
export const userUnenrollClass = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    console.log(`🚫 User ${userId} trying to unenroll from class ${scheduleId}`);
    
    const result = await scheduleRepo.unenrollUser(scheduleId, userId);
    
    console.log(`✅ User ${userId} unenrolled successfully from class ${scheduleId}`);
    
    res.json({ 
      success: true,
      message: 'Hủy đăng ký thành công', 
      data: result 
    });
  } catch (error) {
    console.error('❌ Error unenrolling user:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Có lỗi xảy ra khi hủy đăng ký', 
      error: error.message 
    });
  }
};

export const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const { status } = req.body;
    
    await scheduleRepo.updateEnrollmentStatus(enrollmentId, status);
    
    res.json({ 
      success: true,
      message: "Cập nhật trạng thái thành công"
    });
  } catch (e) { 
    next(e); 
  }
};

export const getSchedulesByWeek = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Cần cung cấp startDate và endDate" 
      });
    }
    
    const schedules = await scheduleRepo.getSchedulesByDateRange(startDate, endDate);
    
    res.json({ 
      success: true,
      data: schedules 
    });
  } catch (e) { 
    next(e); 
  }
};

// Export all classes/schedules to Excel
export const exportSchedules = async (req, res, next) => {
  try {
    console.log('📊 Export schedules called');
    console.log('Query params:', req.query);
    console.log('User:', req.user);
    
    const { trainer_id, from, to, status, difficulty_level, search } = req.query;
    
    const filters = {
      trainer_id: trainer_id ? Number(trainer_id) : null,
      from: from || null,
      to: to || null,
      status: status || null,
      difficulty_level: difficulty_level || null,
      class_name: search || null,
      page: 1,
      limit: 10000 // Get all data for export
    };
    
    const schedules = await scheduleService.list(filters);
    
    // Chuẩn bị data cho Excel
    const excelData = schedules.map((schedule, index) => ({
      stt: index + 1,
      className: schedule.class_name || 'N/A',
      trainer: schedule.trainer_name || 'Chưa có HLV',
      date: schedule.class_date ? new Date(schedule.class_date).toLocaleDateString('vi-VN') : 'N/A',
      time: `${schedule.start_time?.substring(0, 5)} - ${schedule.end_time?.substring(0, 5)}`,
      location: schedule.floor && schedule.room ? `Tầng ${schedule.floor} - ${schedule.room}` : 'N/A',
      participants: `${schedule.current_participants || 0}/${schedule.max_participants || 0}`,
      status: getStatusText(schedule.status),
      difficulty: getDifficultyText(schedule.difficulty_level)
    }));
    
    // Tạo filter summary
    const filterSummary = [];
    if (trainer_id) filterSummary.push(`Huấn luyện viên: ${trainer_id}`);
    if (status) filterSummary.push(`Trạng thái: ${getStatusText(status)}`);
    if (difficulty_level) filterSummary.push(`Độ khó: ${getDifficultyText(difficulty_level)}`);
    if (from) filterSummary.push(`Từ ngày: ${new Date(from).toLocaleDateString('vi-VN')}`);
    if (to) filterSummary.push(`Đến ngày: ${new Date(to).toLocaleDateString('vi-VN')}`);
    
    const headers = [
      { type: 'title', value: 'DANH SÁCH LỚP HỌC & LỊCH TẬP' },
      { type: 'info', value: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}` },
      { type: 'info', value: `Tổng số lớp: ${schedules.length}` }
    ];
    
    if (filterSummary.length > 0) {
      headers.push({ type: 'info', value: `Bộ lọc: ${filterSummary.join(', ')}` });
    }
    
    headers.push({ type: 'empty' });
    
    // Cấu hình xuất Excel
    const config = {
      fileName: `schedules_${new Date().toISOString().split('T')[0]}.xlsx`,
      sheetName: 'Danh sách lớp học',
      headers,
      columns: [
        { header: 'STT', key: 'stt', width: 8 },
        { header: 'Tên lớp học', key: 'className', width: 25 },
        { header: 'Huấn luyện viên', key: 'trainer', width: 25 },
        { header: 'Ngày học', key: 'date', width: 15 },
        { header: 'Thời gian', key: 'time', width: 15 },
        { header: 'Vị trí', key: 'location', width: 20 },
        { header: 'Học viên', key: 'participants', width: 12 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Độ khó', key: 'difficulty', width: 15 }
      ],
      data: excelData,
      styles: presetStyles.green
    };
    
    // Tạo file Excel
    const buffer = await exportToExcel(config);
    
    // Gửi file về client
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(config.fileName)}"`);
    res.send(buffer);
    
  } catch (e) {
    console.error('Error exporting schedules:', e);
    next(e);
  }
};

// Helper functions
function getStatusText(status) {
  const statusMap = {
    'scheduled': 'Đã lên lịch',
    'ongoing': 'Đang diễn ra',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
}

function getDifficultyText(level) {
  const levelMap = {
    'beginner': 'Cơ bản',
    'intermediate': 'Trung cấp',
    'advanced': 'Nâng cao'
  };
  return levelMap[level] || level;
}

// Export enrolled users to Excel
export const exportEnrolledUsers = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    
    // Lấy thông tin lớp học
    const schedule = await scheduleService.byId(scheduleId);
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Lớp học không tồn tại" 
      });
    }
    
    // Lấy danh sách học viên đăng ký
    const enrollments = await scheduleRepo.getEnrollments(scheduleId);
    
    // Chuẩn bị data cho Excel
    const excelData = enrollments.map((user, index) => ({
      stt: index + 1,
      name: user.name || user.full_name || 'N/A',
      email: user.email || 'N/A',
      phone: user.phone || 'N/A',
      enrolledDate: user.enrolled_at ? 
        new Date(user.enrolled_at).toLocaleDateString('vi-VN') : 
        'N/A',
      status: 'Đã đăng ký'
    }));
    
    // Cấu hình xuất Excel
    const config = {
      fileName: `enrolled_users_${schedule.class_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`,
      sheetName: 'Danh sách học viên',
      headers: [
        { type: 'title', value: 'DANH SÁCH HỌC VIÊN ĐĂNG KÝ LỚP HỌC' },
        { type: 'info', value: `Tên lớp: ${schedule.class_name}` },
        { type: 'info', value: `Huấn luyện viên: ${schedule.trainer_name || 'Chưa có'}` },
        { type: 'info', value: `Ngày học: ${new Date(schedule.class_date).toLocaleDateString('vi-VN')}` },
        { type: 'info', value: `Thời gian: ${schedule.start_time?.substring(0, 5)} - ${schedule.end_time?.substring(0, 5)}` },
        { type: 'info', value: `Vị trí: Tầng ${schedule.floor} - ${schedule.room}` },
        { type: 'info', value: `Tổng số học viên: ${enrollments.length}/${schedule.max_participants}` },
        { type: 'empty' }
      ],
      columns: [
        { header: 'STT', key: 'stt', width: 8 },
        { header: 'Tên học viên', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 35 },
        { header: 'Số điện thoại', key: 'phone', width: 18 },
        { header: 'Ngày đăng ký', key: 'enrolledDate', width: 18 },
        { header: 'Trạng thái', key: 'status', width: 15 }
      ],
      data: excelData,
      styles: presetStyles.green // Sử dụng theme xanh lá cho gym
    };
    
    // Tạo file Excel
    const buffer = await exportToExcel(config);
    
    // Gửi file về client
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(config.fileName)}"`);
    res.send(buffer);
    
  } catch (e) { 
    console.error('Error exporting enrolled users:', e);
    next(e); 
  }
};

// Nhân bản lớp học với ngày giờ mới
export const duplicateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { class_date, start_time, end_time } = req.body;

    // Validate required fields
    if (!class_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ ngày và giờ học'
      });
    }

    // Lấy thông tin lớp học gốc
    const originalSchedule = await scheduleService.byId(id);
    if (!originalSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Lớp học không tồn tại'
      });
    }

    // Tạo lớp học mới với thông tin từ lớp cũ
    const newScheduleData = {
      class_name: originalSchedule.class_name,
      description: originalSchedule.description,
      trainer_id: originalSchedule.trainer_id,
      class_date,
      start_time,
      end_time,
      max_participants: originalSchedule.max_participants,
      status: 'scheduled',
      difficulty_level: originalSchedule.difficulty_level,
      floor: originalSchedule.floor,
      room: originalSchedule.room,
      location: originalSchedule.location
    };

    const newSchedule = await scheduleRepo.create(newScheduleData);

    res.status(201).json({
      success: true,
      message: 'Nhân bản lớp học thành công',
      data: newSchedule
    });
  } catch (e) {
    next(e);
  }
};
