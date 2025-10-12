import httpStatus from "http-status-codes";

const { NODE_ENV } = process.env;

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Default to 500 Internal Server Error if status code is not defined
  statusCode = statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  message = message || httpStatus.getStatusText(statusCode);

  const response = {
    success: false,
    message,
    ...(NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export { errorHandler };
