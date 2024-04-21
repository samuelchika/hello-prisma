import Joi from "joi";


const strongPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,30}$/;

export const userSchema = Joi.object({
  firstname: Joi.string().min(2).required(),
  lastname: Joi.string().min(2).required(),
  email: Joi.string().email({ 
    minDomainSegments: 2, 
    maxDomainSegments: 3
  }).required(),
  phone: Joi.string().min(10).max(11).required(),
  password: Joi.string().required(),
  confirm_password: Joi.string().valid(Joi.ref('password')).required(),
  // dateOfBirth: Joi.date().max(dates).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ 
      minDomainSegments: 2, 
      maxDomainSegments: 3,
    }).required(),
    password: Joi.string().required()
});

// This schema will check if password and confirm password is the same
export const changePasswordSchema = Joi.object({
  password: Joi.string().regex(strongPasswordRegex).required(),
  confirm_password: Joi.string().valid(Joi.ref('password')).required(),
});


export const schemas = {'/auth/register': userSchema, '/auth/login': loginSchema, '/auth/change_password': changePasswordSchema};