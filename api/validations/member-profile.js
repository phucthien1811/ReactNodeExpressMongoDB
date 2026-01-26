import { body, query, param } from 'express-validator';

export const validateUpdateProfile = [
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
    
  body('birth_date')
    .optional()
    .isDate()
    .withMessage('Ngày sinh không hợp lệ'),
    
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính phải là male, female hoặc other'),
    
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Chiều cao phải từ 50cm đến 300cm'),
    
  body('weight')
    .optional()
    .isFloat({ min: 10, max: 500 })
    .withMessage('Cân nặng phải từ 10kg đến 500kg'),
    
  body('activity_level')
    .optional()
    .isIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .withMessage('Mức độ hoạt động không hợp lệ'),
    
  body('emergency_contact_phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại người liên hệ phải có 10-11 chữ số')
];

export const validateMembershipUpdate = [
  body('membership_status')
    .notEmpty()
    .isIn(['active', 'inactive', 'expired', 'suspended'])
    .withMessage('Trạng thái membership không hợp lệ'),
    
  body('membership_start_date')
    .optional()
    .isDate()
    .withMessage('Ngày bắt đầu không hợp lệ'),
    
  body('membership_end_date')
    .optional()
    .isDate()
    .withMessage('Ngày kết thúc không hợp lệ'),
    
  body('membership_type')
    .optional()
    .isIn(['basic', 'premium', 'vip'])
    .withMessage('Loại membership phải là basic, premium hoặc vip')
];

export const validateProfileQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit phải từ 1 đến 100'),
    
  query('role')
    .optional()
    .isIn(['admin', 'trainer', 'member'])
    .withMessage('Role phải là admin, trainer hoặc member')
];

export const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID phải là số nguyên dương')
];