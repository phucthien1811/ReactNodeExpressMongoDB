import Joi from 'joi';

export const packageValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional().allow(''),
    price: Joi.number().positive().required(),
    duration_days: Joi.number().integer().positive().required(),
    features: Joi.array().items(Joi.string()).default([]),
    is_active: Joi.boolean().default(true),
    is_published: Joi.boolean().default(false),
    sort_order: Joi.number().integer().default(0)
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional().allow(''),
    price: Joi.number().positive().optional(),
    duration_days: Joi.number().integer().positive().optional(),
    features: Joi.array().items(Joi.string()).optional(),
    is_active: Joi.boolean().optional(),
    is_published: Joi.boolean().optional(),
    sort_order: Joi.number().integer().optional()
  }),

  register: Joi.object({
    member_id: Joi.number().integer().positive().required(),
    package_id: Joi.number().integer().positive().required(),
    paid_amount: Joi.number().positive().required(),
    notes: Joi.string().max(500).optional().allow('')
  }),

  extend: Joi.object({
    days: Joi.number().integer().positive().required(),
    additional_amount: Joi.number().min(0).optional().default(0)
  }),

  cancel: Joi.object({
    reason: Joi.string().max(500).optional().allow('')
  })
};

export default packageValidation;