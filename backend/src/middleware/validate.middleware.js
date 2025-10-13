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

  // Instead of replacing req.body, req.query, etc., we merge the validated values back in.
  // This avoids the "Cannot set property of #<IncomingMessage> which has only a getter" error.
  Object.assign(req.body, value.body || {});
  Object.assign(req.query, value.query || {});
  Object.assign(req.params, value.params || {});

  return next();
};
