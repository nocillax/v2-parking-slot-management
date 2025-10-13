import httpStatus from "http-status-codes";
import models from "#models/index.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import { ApiError } from "#utils/ApiError.js";
import { emailService } from "#services/email.service.js";
import crypto from "crypto";

const { JWT_REFRESH_TOKEN_SECRET } = process.env;

const checkEmailExists = async (email) => {
  if (await models.User.findOne({ where: { email } })) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
};

const createUser = async (userData) => {
  await checkEmailExists(userData.email);
  // Password hashing is handled by the 'beforeCreate' hook in the User model
  const user = await models.User.create(userData);
  return user.toJSON(); // Use toJSON to exclude password
};

const loginUser = async (email, password) => {
  const user = await models.User.findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store the refresh token in the database
  user.refresh_token = refreshToken;
  await user.save({ fields: ["refresh_token"] });

  return { user: user.toJSON(), accessToken, refreshToken };
};

const refreshAuthToken = async (token) => {
  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token is required");
  }

  const decoded = jwt.verify(token, JWT_REFRESH_TOKEN_SECRET);

  const user = await models.User.findByPk(decoded.id);

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  if (user.refresh_token !== token) {
    // This is a security measure. If the token in DB is not the one provided, it means it might have been stolen or the user logged out.
    throw new ApiError(httpStatus.FORBIDDEN, "Refresh token has been revoked");
  }

  const newAccessToken = user.generateAccessToken();
  return { accessToken: newAccessToken };
};

const forgotPassword = async (email) => {
  const user = await models.User.findOne({ where: { email } });
  if (!user) {
    // We don't want to reveal if a user exists or not for security reasons
    return;
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save();

  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  } catch (error) {
    // If email fails, clear the token to allow user to try again
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await user.save();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to send password reset email."
    );
  }
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await models.User.findOne({
    where: {
      password_reset_token: hashedToken,
      password_reset_expires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Token is invalid or has expired"
    );
  }

  user.password = newPassword; // Hashing is handled by the model's 'beforeUpdate' hook
  user.password_reset_token = null;
  user.password_reset_expires = null;
  await user.save();
};

export const authService = {
  createUser,
  loginUser,
  refreshAuthToken,
  forgotPassword,
  resetPassword,
};
