import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { validate } from "../middleware/validate.js";
import { createScheduleSchema, updateScheduleSchema } from "../validations/schedule.js";
import {
  listSchedules, 
  getSchedule, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule,
  enrollStudent,
  removeEnrollment,
  updateEnrollmentStatus,
  getSchedulesByWeek,
  getMyEnrollments,
  userEnrollClass,
  userUnenrollClass,
  exportEnrolledUsers,
  exportSchedules,
  duplicateSchedule
} from "../handlers/schedule.handler.js";

const router = Router();

// Protected routes - cần đăng nhập cho tất cả
router.use(auth);

// Test endpoint
router.get('/test', (req, res) => {
  console.log('🧪 Test endpoint hit by user:', req.user?.id);
  res.json({ message: 'Schedule routes working', user: req.user?.id });
});

// User specific routes - phải đặt trước các route có params
router.get("/my-enrollments", getMyEnrollments); // User xem lịch của mình

// Export routes - phải đặt trước các route có params
router.get("/export", authorizeRoles(['admin']), exportSchedules); // Export all schedules

// Public routes - xem lịch học (nhưng vẫn cần auth để biết user nào)
router.get("/", listSchedules);
router.get("/week", getSchedulesByWeek);
router.get("/:id", getSchedule);

// Admin routes - quản lý lịch học
router.post("/", authorizeRoles(['admin']), validate(createScheduleSchema), createSchedule);
router.put("/:id", authorizeRoles(['admin']), validate(updateScheduleSchema), updateSchedule);
router.delete("/:id", authorizeRoles(['admin']), deleteSchedule);
router.post("/:id/duplicate", authorizeRoles(['admin']), duplicateSchedule); // Nhân bản lớp học

// User enrollment management - Member tự đăng ký/hủy
router.post("/:id/enroll", userEnrollClass); // User đăng ký lớp học
router.delete("/:id/enroll", userUnenrollClass); // User hủy đăng ký (changed to DELETE)

// Admin enrollment management - Admin thêm/xóa học viên
router.post("/:scheduleId/enrollments", authorizeRoles(['admin']), enrollStudent); // Admin thêm học viên
router.delete("/:scheduleId/enrollments/:userId", authorizeRoles(['admin']), removeEnrollment); // Admin xóa học viên
router.patch("/enrollments/:enrollmentId/status", authorizeRoles(['admin']), updateEnrollmentStatus);

// Export enrolled users to Excel
router.get("/:id/enrollments/export", authorizeRoles(['admin']), exportEnrolledUsers);

export default router;
