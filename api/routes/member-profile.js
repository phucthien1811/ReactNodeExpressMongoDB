import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import memberProfileController from '../controllers/member-profile.controller.js';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import {
  validateUpdateProfile,
  validateMembershipUpdate,
  validateProfileQuery,
  validateUserId
} from '../validations/member-profile.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// === USER ROUTES ===

// Lấy profile của user hiện tại
router.get('/my-profile', auth, memberProfileController.getMyProfile);

// Cập nhật profile của user hiện tại (với avatar upload)
router.put('/my-profile', 
  auth, 
  upload.single('avatar'),
  validateUpdateProfile,
  memberProfileController.updateMyProfile
);

// Upload avatar
router.post('/my-profile/avatar',
  auth,
  upload.single('avatar'),
  memberProfileController.uploadAvatar
);

// === ADMIN ROUTES ===

// Lấy tất cả profiles
router.get('/admin/all',
  auth,
  authorizeRoles(['admin']),
  validateProfileQuery,
  memberProfileController.getAllProfiles
);

// Lấy profile của user khác
router.get('/admin/:userId',
  auth,
  authorizeRoles(['admin']),
  validateUserId,
  memberProfileController.getProfileById
);

// Cập nhật profile của user khác
router.put('/admin/:userId',
  auth,
  authorizeRoles(['admin']),
  validateUserId,
  validateUpdateProfile,
  memberProfileController.updateProfileById
);

// Cập nhật thông tin membership
router.patch('/admin/:userId/membership',
  auth,
  authorizeRoles(['admin']),
  validateUserId,
  validateMembershipUpdate,
  memberProfileController.updateMembershipInfo
);

// Xóa profile
router.delete('/admin/:userId',
  auth,
  authorizeRoles(['admin']),
  validateUserId,
  memberProfileController.deleteProfile
);

export default router;