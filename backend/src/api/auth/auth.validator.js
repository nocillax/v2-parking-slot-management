import Joi from "joi";

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    vehicle_number: Joi.string().optional(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().required().min(6),
  }),
};

const updateUser = {
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      // Make vehicle number optional and allow it to be cleared with an empty string or null
      default_vehicle_no: Joi.string().max(20).optional().allow("", null),
      default_division_id: Joi.string().uuid().optional().allow(null),
      default_district_id: Joi.string().uuid().optional().allow(null),
      default_area_id: Joi.string().uuid().optional().allow(null),
    })
    .min(1), // Ensure at least one field is being updated
};

export const authValidator = {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateUser,
};
