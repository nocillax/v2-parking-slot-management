import asyncHandler from "express-async-handler";
import httpStatus from "http-status-codes";
import { reservationService } from "./reservations.service.js";
import { notificationService } from "#services/notification.service.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { ApiError } from "#utils/ApiError.js";

const createReservation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const createdReservations = await reservationService.createReservation(
    userId,
    req.body
  );

  // Send notifications after the transaction is successful
  for (const { reservation, slot } of createdReservations) {
    const facility = await slot.getFacility();
    await notificationService.reservationConfirmed(userId, {
      slot_number: slot.location_tag || `Slot #${slot.id.slice(0, 4)}`,
      lot_name: facility.name,
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      amount: reservation.total_amount,
      reservation_id: reservation.id,
    });
  }

  res.status(httpStatus.CREATED).json(
    new ApiResponse(
      httpStatus.CREATED,
      createdReservations.map(({ reservation }) => reservation),
      "Reservation(s) created successfully."
    )
  );
});

const getUserReservations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reservations = await reservationService.getReservationsByUserId(
    userId,
    req.query
  );

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, reservations));
});

const getReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const reservation = await reservationService.getReservationById(id, userId);

  if (!reservation) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Reservation not found or you do not have permission to view it."
    );
  }

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, reservation));
});

export const reservationController = {
  createReservation,
  getUserReservations,
  getReservation,
};
