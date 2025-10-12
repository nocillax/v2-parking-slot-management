import Joi from "joi";
import httpStatus from "http-status-codes";
import { ApiError } from "#utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
  const objectToValidate = {};
  if (schema.params) objectToValidate.params = req.params;
  if (schema.body) objectToValidate.body = req.body;
  if (schema.query) objectToValidate.query = req.query;

  const { error, value } = Joi.compile(schema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(objectToValidate);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value);
  return next();
};
