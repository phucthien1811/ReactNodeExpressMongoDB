import Joi from "joi";

export const createMemberSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  joined_at: Joi.date().optional(),
  expires_at: Joi.date().optional(),
  active: Joi.boolean().default(true),
});

export const updateMemberSchema = Joi.object({
  name: Joi.string().min(2),
  email: Joi.string().email(),
  phone: Joi.string(),
  joined_at: Joi.date(),
  expires_at: Joi.date(),
  active: Joi.boolean(),
}).min(1); // ít nhất phải có 1 field khi update
