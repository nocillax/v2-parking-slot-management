import asyncHandler from "express-async-handler";
import httpStatus from "http-status-codes";
import NotificationService from "#services/NotificationService.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { ApiError } from "#utils/ApiError.js";

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const options = req.query;

  const notifications = await NotificationService.getUserNotifications(
    userId,
    options
  );

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, notifications));
});

const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  await NotificationService.markAsRead([notificationId], userId);

  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, null, "Notification marked as read."));
});

const generateTestNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Generate a few different types of notifications for the current user
  await NotificationService.reservationConfirmed(
    userId,
    {
      slot_number: "A-05",
      lot_name: "City Center Parking",
      start_time: "10:00 AM",
      end_time: "12:00 PM",
      amount: "15.50",
      reservation_id: "dummy-res-1",
    },
    true
  ); // <-- Add 'true' here to send the email

  await NotificationService.overstayWarning(userId, {
    slot_number: "B-12",
    overstay_amount: "5.00",
    reservation_id: "dummy-res-2",
  });

  await NotificationService.paymentReceipt(userId, {
    amount: "20.50",
    lot_name: "Downtown Garage",
    transaction_id: "sim_dummy_txn_123",
    payment_id: "dummy-pay-1",
    reservation_id: "dummy-res-3",
  });

  res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(httpStatus.CREATED, null, "3 test notifications created.")
    );
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await NotificationService.markAllAsRead(userId);

  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, null, "All notifications marked as read.")
    );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const deletedCount = await NotificationService.deleteNotification(
    notificationId,
    userId
  );

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found.");
  }

  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, null, "Notification deleted."));
});

export const notificationController = {
  getNotifications,
  markAsRead,
  generateTestNotifications,
  markAllAsRead,
  deleteNotification,
};
