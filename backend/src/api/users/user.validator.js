import Joi from "joi";

const createUser = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    default_vehicle_no: Joi.string().optional().allow("", null),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      email: Joi.string().email(),
      password: Joi.string().min(6),
      role: Joi.string().valid("admin", "user"),
      default_vehicle_no: Joi.string().optional().allow("", null),
    })
    .min(1),
};

const deleteUsers = {
  body: Joi.object().keys({
    ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  }),
};

export const userValidator = { createUser, updateUser, deleteUsers };
