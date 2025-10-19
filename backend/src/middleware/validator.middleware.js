import Joi from "joi";
import httpStatus from "http-status-codes";
import { ApiError } from "#utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
  const validSchema = Joi.compile(schema);
  const objectToValidate = {};
  if (schema.body) objectToValidate.body = req.body;
  if (schema.query) objectToValidate.query = req.query;
  if (schema.params) objectToValidate.params = req.params;

  const { value, error } = validSchema.validate(objectToValidate, {
    abortEarly: false,
    allowUnknown: true, // Allow other keys on the request object (e.g. req.user)
    stripUnknown: true, // Remove unknown keys from the validated object
  });

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value);
  return next();
};
