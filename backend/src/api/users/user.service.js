import models from "#models/index.js";
import { ApiError } from "#utils/ApiError.js";
import httpStatus from "http-status-codes";

const { User } = models;

export const getAllUsers = async () => {
  // TODO: Add pagination in the future
  const users = await User.findAndCountAll({
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: [
        "password",
        "refresh_token",
        "password_reset_token",
        "password_reset_expires",
      ],
    },
  });

  return users;
};

export const createUser = async (userData) => {
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User with this email already exists"
    );
  }
  const user = await User.create(userData);
  return user;
};

export const updateUser = async (userId, updateData) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Prevent updating email to one that already exists
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await User.findOne({
      where: { email: updateData.email },
    });
    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email is already in use");
    }
  }

  return await user.update(updateData);
};

export const deleteUsers = async (userIds) => {
  return await User.destroy({ where: { id: userIds } });
};
