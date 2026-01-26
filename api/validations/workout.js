import Joi from "joi";

export const createWorkoutSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().allow(""),
  duration_min: Joi.number().integer().min(1).default(60),
  trainer_id: Joi.number().integer().allow(null),
  active: Joi.boolean().default(true),
});

export const updateWorkoutSchema = Joi.object({
  name: Joi.string().min(2),
  description: Joi.string().allow(""),
  duration_min: Joi.number().integer().min(1),
  trainer_id: Joi.number().integer().allow(null),
  active: Joi.boolean(),
}).min(1);
