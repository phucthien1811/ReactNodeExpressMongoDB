import Joi from "joi";

export const createScheduleSchema = Joi.object({
  class_name: Joi.string().required().max(255),
  description: Joi.string().allow('', null),
  trainer_id: Joi.number().integer().allow(null),
  max_participants: Joi.number().integer().min(1).default(20),
  price: Joi.number().min(0).default(0),
  room: Joi.string().allow('', null),
  floor: Joi.number().integer().min(1).max(4).default(1), // Thêm trường floor
  start_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  class_date: Joi.date().required(),
  day_of_week: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').allow(null),
  is_recurring: Joi.boolean().default(false),
  status: Joi.string().valid('scheduled', 'ongoing', 'completed', 'cancelled').default('scheduled'),
  difficulty_level: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner'),
  location: Joi.string().allow('', null),
  equipment_needed: Joi.array().items(Joi.string()).allow(null)
});

export const updateScheduleSchema = Joi.object({
  class_name: Joi.string().max(255),
  description: Joi.string().allow('', null),
  trainer_id: Joi.number().integer().allow(null),
  max_participants: Joi.number().integer().min(1),
  current_participants: Joi.number().integer().min(0),
  price: Joi.number().min(0),
  room: Joi.string().allow('', null),
  floor: Joi.number().integer().min(1).max(4), // Thêm trường floor
  start_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  class_date: Joi.date(),
  day_of_week: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').allow(null),
  is_recurring: Joi.boolean(),
  status: Joi.string().valid('scheduled', 'ongoing', 'completed', 'cancelled'),
  difficulty_level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  location: Joi.string().allow('', null),
  equipment_needed: Joi.array().items(Joi.string()).allow(null)
}).min(1);