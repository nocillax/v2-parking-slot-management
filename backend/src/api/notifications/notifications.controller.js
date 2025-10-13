import asyncHandler from "express-async-handler";
import httpStatus from "http-status-codes";
import NotificationService from "#services/NotificationService.js";
import { ApiResponse } from "#utils/ApiResponse.js";

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const options = req.query;

  const notifications = await NotificationService.getUserNotifications(
    userId,
    options
  );

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, notifications));
});

export const notificationController = {
  getNotifications,
};
