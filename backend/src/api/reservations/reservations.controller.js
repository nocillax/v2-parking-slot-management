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

const getFacilityReservations = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const adminId = req.user.id;

  const reservations = await reservationService.getReservationsByFacilityId(
    facilityId,
    adminId,
    req.query
  );

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, reservations));
});

const cancelReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const cancelledReservation = await reservationService.cancelReservationById(
    id,
    userId
  );

  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        cancelledReservation,
        "Reservation cancelled successfully."
      )
    );
});

const checkInReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vehicle_number } = req.body;
  const adminId = req.user.id;

  const checkedInReservation = await reservationService.checkInReservationById(
    id,
    adminId,
    vehicle_number
  );

  // Send notification after successful check-in
  await notificationService.createAndSend(
    checkedInReservation.user_id,
    "check_in_success",
    {
      slot_number: checkedInReservation.slot.location_tag,
      lot_name: checkedInReservation.slot.facility.name,
      vehicle_number: checkedInReservation.vehicle_no,
    }
  );

  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        checkedInReservation,
        "Reservation checked-in successfully."
      )
    );
});

const checkOutReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  const checkedOutReservation =
    await reservationService.checkOutReservationById(id, adminId);

  // Send payment receipt notification
  const payment = (await checkedOutReservation.getPayments())[0];
  await notificationService.paymentReceipt(checkedOutReservation.user_id, {
    reservation_id: checkedOutReservation.id,
    payment_id: payment.id,
    amount: checkedOutReservation.total_amount,
    vehicle_number: checkedOutReservation.vehicle_no,
  });

  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        checkedOutReservation,
        "Reservation checked-out successfully."
      )
    );
});

export const reservationController = {
  createReservation,
  getUserReservations,
  getReservation,
  getFacilityReservations,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
};
