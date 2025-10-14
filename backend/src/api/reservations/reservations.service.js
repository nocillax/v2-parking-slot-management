import { sequelize } from "#models/index.js";
import models from "#models/index.js";
import { Op } from "sequelize";
import { ApiError } from "#utils/ApiError.js";
import { notificationService } from "#services/notification.service.js";
import dayjs from "dayjs";

const findAvailableSlots = async (
  { facility_id, start_time, end_time, slot_type, count },
  transaction
) => {
  const overlappingReservations = await models.Reservation.findAll({
    attributes: ["slot_id"],
    where: {
      status: { [Op.notIn]: ["Cancelled", "Expired", "Completed"] },
      [Op.or]: [
        { start_time: { [Op.between]: [start_time, end_time] } },
        { end_time: { [Op.between]: [start_time, end_time] } },
        {
          [Op.and]: [
            { start_time: { [Op.lte]: start_time } },
            { end_time: { [Op.gte]: end_time } },
          ],
        },
      ],
    },
    raw: true,
    transaction,
  });

  const unavailableSlotIds = overlappingReservations.map((r) => r.slot_id);

  return await models.Slot.findAll({
    where: {
      id: { [Op.notIn]: unavailableSlotIds },
      facility_id,
      slot_type,
      status: "Free",
    },
    limit: count,
    transaction,
  });
};

const createReservationRecords = async (
  { user_id, start_time, end_time, availableSlots },
  transaction
) => {
  const durationHours = dayjs(end_time).diff(dayjs(start_time), "hour", true);

  const reservationPromises = availableSlots.map(async (slot) => {
    const total_amount = durationHours * slot.hourly_rate;
    const reservation = await models.Reservation.create(
      {
        user_id,
        slot_id: slot.id,
        start_time,
        end_time,
        total_amount,
      },
      { transaction }
    );

    await models.Payment.create(
      { reservation_id: reservation.id, amount: total_amount },
      { transaction }
    );

    return { reservation, slot };
  });

  return Promise.all(reservationPromises);
};

const createReservation = async (userId, reservationData) => {
  const { facility_id, start_time, end_time, requests } = reservationData;

  return sequelize.transaction(async (t) => {
    let allCreatedReservations = [];

    for (const request of requests) {
      const availableSlots = await findAvailableSlots(
        { ...request, facility_id, start_time, end_time },
        t
      );

      if (availableSlots.length < request.count) {
        throw new ApiError(
          409,
          `Not enough '${request.slot_type}' slots available for the selected time.`
        );
      }

      const createdReservations = await createReservationRecords(
        { user_id: userId, start_time, end_time, availableSlots },
        t
      );

      const reservedSlotIds = availableSlots.map((slot) => slot.id);
      await models.Slot.update(
        { status: "Reserved" },
        { where: { id: { [Op.in]: reservedSlotIds } }, transaction: t }
      );

      allCreatedReservations.push(...createdReservations);
    }

    return allCreatedReservations;
  });
};

const getReservationsByUserId = async (userId, options) => {
  const { page = 1, limit = 10, status, sortBy = "start_time:desc" } = options;

  const where = { user_id: userId };
  if (status) {
    where.status = status;
  }

  const [sortField, sortOrder] = sortBy.split(":");

  return await models.Reservation.findAndCountAll({
    where,
    include: [
      {
        model: models.Slot,
        as: "slot",
        include: [
          {
            model: models.Facility,
            as: "facility",
            attributes: ["id", "name", "address"],
          },
        ],
      },
    ],
    order: [[sortField, sortOrder.toUpperCase()]],
    limit,
    offset: (page - 1) * limit,
  });
};

const getReservationById = async (reservationId, userId) => {
  const reservation = await models.Reservation.findOne({
    where: {
      id: reservationId,
      user_id: userId, // Ownership check
    },
    include: [
      {
        model: models.Slot,
        as: "slot",
        include: [
          {
            model: models.Facility,
            as: "facility",
            attributes: ["id", "name", "address"],
          },
        ],
      },
      {
        model: models.Payment,
        as: "payments",
      },
    ],
  });
  return reservation;
};

const getReservationsByFacilityId = async (facilityId, adminId, options) => {
  // 1. Check if facility exists and if the admin owns it
  const facility = await models.Facility.findByPk(facilityId);
  if (!facility) {
    throw new ApiError(404, "Facility not found.");
  }
  if (facility.admin_id !== adminId) {
    throw new ApiError(
      403,
      "You are not authorized to view reservations for this facility."
    );
  }

  // 2. Prepare query options
  const {
    page = 1,
    limit = 10,
    status,
    user_id,
    sortBy = "start_time:desc",
  } = options;

  const where = {};
  if (status) where.status = status;
  if (user_id) where.user_id = user_id;

  const [sortField, sortOrder] = sortBy.split(":");

  // 3. Find all slots belonging to the facility
  const facilitySlots = await models.Slot.findAll({
    where: { facility_id: facilityId },
    attributes: ["id"],
    raw: true,
  });
  const facilitySlotIds = facilitySlots.map((slot) => slot.id);
  where.slot_id = { [Op.in]: facilitySlotIds };

  // 4. Fetch reservations
  return await models.Reservation.findAndCountAll({
    where,
    include: [
      { model: models.Slot, as: "slot", attributes: ["id", "location_tag"] },
      { model: models.User, as: "user", attributes: ["id", "name", "email"] },
    ],
    order: [[sortField, sortOrder.toUpperCase()]],
    limit,
    offset: (page - 1) * limit,
  });
};

const cancelReservationById = async (reservationId, userId) => {
  return sequelize.transaction(async (t) => {
    // 1. Find the reservation, ensuring it belongs to the user
    const reservation = await models.Reservation.findOne({
      where: {
        id: reservationId,
        user_id: userId,
      },
      transaction: t,
      lock: t.LOCK.UPDATE, // Lock the row to prevent race conditions
    });

    if (!reservation) {
      throw new ApiError(
        404,
        "Reservation not found or you do not have permission to cancel it."
      );
    }

    // 2. Check if the reservation is in a cancellable state
    if (reservation.status !== "Active") {
      throw new ApiError(
        400,
        `Cannot cancel reservation with status '${reservation.status}'. Only 'Active' reservations can be cancelled.`
      );
    }

    // 3. Update reservation and free up the slot
    reservation.status = "Cancelled";
    await reservation.save({ transaction: t });

    await models.Slot.update(
      { status: "Free" },
      { where: { id: reservation.slot_id }, transaction: t }
    );

    return reservation;
  });
};

export const reservationService = {
  createReservation,
  getReservationsByUserId,
  getReservationById,
  getReservationsByFacilityId,
  cancelReservationById,
};
