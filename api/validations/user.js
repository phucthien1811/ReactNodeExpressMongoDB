import Joi from 'joi';

export const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc'
  }),
  name: Joi.string().required().messages({
    'any.required': 'Tên là bắt buộc'
  }),
  role: Joi.string().valid('member', 'trainer').default('member').messages({
    'any.only': 'Role chỉ có thể là member hoặc trainer'
  }),
  phone: Joi.string().allow('', null).optional()
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': 'Email không hợp lệ'
  }),
  password: Joi.string().min(6).optional().allow('').messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự'
  }),
  name: Joi.string().optional(),
  role: Joi.string().valid('member', 'trainer').optional().messages({
    'any.only': 'Role chỉ có thể là member hoặc trainer'
  }),
  phone: Joi.string().allow('', null).optional()
});
