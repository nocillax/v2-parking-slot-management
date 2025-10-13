import jwt from "jsonwebtoken";
import httpStatus from "http-status-codes";
import asyncHandler from "express-async-handler";
import { ApiError } from "#utils/ApiError.js";
import models from "#models/index.js";

const { JWT_SECRET } = process.env;

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  throw new ApiError(httpStatus.UNAUTHORIZED, "Authorization token required");
};

const verifyAndAttachUser = async (req, token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await models.User.findByPk(decoded.id);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
  }
  req.user = user;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  await verifyAndAttachUser(req, token);
  next();
});

export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        `Forbidden: This resource is restricted to roles: ${roles.join(", ")}`
      );
    }
    next();
  });
