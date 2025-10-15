import asyncHandler from "express-async-handler";
import httpStatus from "http-status-codes";
import { authService } from "./auth.service.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { ApiError } from "#utils/ApiError.js";
import models from "#models/index.js";

const { NODE_ENV } = process.env;

const register = asyncHandler(async (req, res) => {
  const user = await authService.createUser(req.body);
  res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(httpStatus.CREATED, user, "User registered successfully")
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(
    email,
    password
  );

  const cookieOptions = {
    httpOnly: true,
    secure: NODE_ENV === "production",
  };

  res
    .status(httpStatus.OK)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(httpStatus.OK, { user, accessToken }, "Login successful")
    );
});

const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by the 'protect' middleware
  const user = req.user.toJSON();
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, { user }));
});

const updateMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, email, default_vehicle_no, default_area_id } = req.body;

  const user = await models.User.findByPk(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (name !== undefined) {
    user.name = name;
  }
  if (email !== undefined) {
    user.email = email;
  }
  if (default_vehicle_no !== undefined) {
    user.default_vehicle_no = default_vehicle_no;
  }
  if (default_area_id !== undefined) {
    user.default_area_id = default_area_id;
  }

  await user.save();

  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, { user: user.toJSON() }));
});

const testAdmin = asyncHandler(async (req, res) => {
  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, null, "Success! Admin access granted.")
    );
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  const { accessToken } = await authService.refreshAuthToken(
    incomingRefreshToken
  );

  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        { accessToken },
        "Access token refreshed successfully"
      )
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        null,
        "Password reset email sent successfully"
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, null, "Password reset successful"));
});

export const authController = {
  register,
  login,
  getMe,
  updateMe,
  testAdmin,
  refreshToken,
  forgotPassword,
  resetPassword,
};
