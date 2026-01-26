import Joi from 'joi';

// Validation cho tạo đơn hàng
export const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      id: Joi.alternatives().try(Joi.string(), Joi.number()),
      product_name: Joi.string().min(1).max(255),
      name: Joi.string().min(1).max(255),
      product_image: Joi.string().allow(''), // Cho phép string bất kỳ
      image: Joi.string().allow(''), // Cho phép string bất kỳ
      unit_price: Joi.number().positive().required(),
      price: Joi.number().positive(),
      quantity: Joi.number().integer().positive().required()
    })
  ).min(1).required(),
  
  shipping_address: Joi.object({
    full_name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
    address: Joi.string().min(5).max(255).required(),
    ward: Joi.string().min(2).max(100).required(),
    district: Joi.string().min(2).max(100).required(),
    province: Joi.string().min(2).max(100).required(),
    postal_code: Joi.string().max(10).allow('')
  }).required(),
  
  payment_method: Joi.string().valid('COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'ZALOPAY', 'CREDIT_CARD', 'cod', 'bank_transfer', 'momo', 'vnpay', 'zalopay', 'credit_card').required(),
  shipping_fee: Joi.number().min(0).default(0),
  discount_amount: Joi.number().min(0).default(0),
  voucher_code: Joi.string().max(20).optional().allow(null, ''),
  notes: Joi.string().max(500).optional().allow('', null)
});

// Validation cho cập nhật trạng thái đơn hàng
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').required(),
  notes: Joi.string().max(500).allow('')
});

// Validation cho cập nhật trạng thái thanh toán
export const updatePaymentStatusSchema = Joi.object({
  payment_status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').required()
});

// Validation cho query parameters
export const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
  search: Joi.string().max(100).allow('')
});

// Middleware validation function
export const validateCreateOrder = (req, res, next) => {
  const { error } = createOrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

export const validateUpdateOrderStatus = (req, res, next) => {
  const { error } = updateOrderStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

export const validateUpdatePaymentStatus = (req, res, next) => {
  const { error } = updatePaymentStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

export const validateOrderQuery = (req, res, next) => {
  const { error } = orderQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};