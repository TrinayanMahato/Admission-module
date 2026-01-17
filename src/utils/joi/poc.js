const Joi = require('joi');

const superAdminValidationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is a required field'
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be between 10 and 15 digits'
    }),

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long'
    }),

  role: Joi.string()
    .valid('SuperAdmin', 'Admin')
    .required(),

  department: Joi.string()
    .required()
    .trim()
});

module.exports = {
  superAdminValidationSchema
};
