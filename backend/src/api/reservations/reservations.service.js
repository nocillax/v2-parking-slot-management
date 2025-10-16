import { sequelize } from "#models/index.js";
import models from "#models/index.js";
import { Op } from "sequelize";
import { ApiError } from "#utils/ApiError.js";
import { waitlistService } from "#api/waitlist/waitlist.service.js";
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
        // Case 1: Existing reservation starts during the new reservation period.
        {
          start_time: {
            [Op.lt]: end_time,
            [Op.gt]: start_time,
          },
        },
        // Case 2: Existing reservation ends during the new reservation period.
        {
          end_time: {
            [Op.lt]: end_time,
            [Op.gt]: start_time,
          },
        },
        // Case 3: Existing reservation completely envelops the new reservation period.
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

  // Validate that start_time is not in the past (allow up to 5 minutes in the past for timezone/delay tolerance)
  if (dayjs(start_time).isBefore(dayjs().subtract(5, "minute"))) {
    throw new ApiError(400, "Start time cannot be in the past.");
  }

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
      // Don't change slot status - keep slots as "Free" and check availability by time
      // await models.Slot.update(
      //   { status: "Reserved" },
      //   { where: { id: { [Op.in]: reservedSlotIds } }, transaction: t }
      // );

      allCreatedReservations.push(...createdReservations);
    }

    return allCreatedReservations;
  });
};

const getReservationsByUserId = async (userId, options) => {
  const {
    page = 1,
    limit = 10,
    status,
    slot_type,
    sortBy = "start_time:asc",
  } = options;

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
        where: slot_type ? { slot_type } : undefined,
        required: !!slot_type,
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

    // 3. Use the model method to perform the cancellation logic
    const freedSlot = await reservation.cancel({ transaction: t });

    // 4. After transaction commits, process the waitlist for the freed slot
    t.afterCommit(() => {
      waitlistService.processNextInQueue(freedSlot).catch(console.error);
    });

    return reservation;
  });
};

const checkInReservationById = async (
  reservationId,
  adminId,
  vehicleNumber
) => {
  return sequelize.transaction(async (t) => {
    // Step 1: Find the reservation and its associations for authorization check (no lock)
    const reservationForAuth = await models.Reservation.findOne({
      where: { id: reservationId },
      include: [{ model: models.Slot, as: "slot", include: ["facility"] }],
      transaction: t,
    });

    if (!reservationForAuth) {
      throw new ApiError(404, "Reservation not found.");
    }

    // Step 2: Authorization: Check if admin owns the facility
    if (reservationForAuth.slot.facility.admin_id !== adminId) {
      throw new ApiError(
        403,
        "You are not authorized to check-in reservations for this facility."
      );
    }

    // Step 3: Now, find the same reservation again WITH a lock to prevent race conditions
    const reservation = await models.Reservation.findByPk(reservationId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // Prevent checking into a reservation that has already ended
    if (dayjs().isAfter(dayjs(reservation.end_time))) {
      throw new ApiError(
        400,
        "Cannot check-in, the reservation period has already ended."
      );
    }

    // Step 4: Use the model method to perform the check-in logic
    await reservation.checkIn(vehicleNumber, { transaction: t });

    // Step 5: Reload to get the updated associations for the response
    await reservation.reload({
      include: [
        { model: models.Slot, as: "slot", include: ["facility"] },
        { model: models.User, as: "user", attributes: ["id", "name"] },
      ],
      transaction: t,
    });
    return reservation;
  });
};

const checkOutReservationById = async (reservationId, adminId) => {
  return sequelize.transaction(async (t) => {
    // Step 1: Find reservation for auth check (no lock)
    const reservationForAuth = await models.Reservation.findOne({
      where: { id: reservationId },
      include: [{ model: models.Slot, as: "slot", include: ["facility"] }],
      transaction: t,
    });

    if (!reservationForAuth) {
      throw new ApiError(404, "Reservation not found.");
    }

    // Step 2: Authorization
    if (reservationForAuth.slot.facility.admin_id !== adminId) {
      throw new ApiError(
        403,
        "You are not authorized to check-out reservations for this facility."
      );
    }

    // Step 3: Find the same reservation again WITH a lock
    const reservation = await models.Reservation.findByPk(reservationId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // Step 4: Use the model method to perform the check-out logic
    // The model now handles status changes, overstay calcs, and slot/payment updates
    const freedSlot = await reservation.checkOut({ transaction: t });

    t.afterCommit(() => {
      waitlistService.processNextInQueue(freedSlot).catch(console.error);
    });

    return reservation;
  });
};

const createReservationFromWaitlist = async (userId, waitlistId) => {
  return sequelize.transaction(async (t) => {
    // 1. Find and lock the waitlist entry
    const waitlistEntry = await models.Waitlist.findOne({
      where: { id: waitlistId, user_id: userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!waitlistEntry) {
      throw new ApiError(404, "Waitlist entry not found.");
    }

    // 2. Validate the waitlist entry's state
    if (waitlistEntry.status !== "Notified") {
      throw new ApiError(400, "You have not been notified for a slot yet.");
    }
    if (new Date() > waitlistEntry.notification_expires_at) {
      waitlistEntry.status = "Expired";
      await waitlistEntry.save({ transaction: t });
      throw new ApiError(400, "Your offer to reserve this slot has expired.");
    }

    // 3. Get the offered slot from the notification metadata
    const { slot_id } = waitlistEntry.metadata;
    const slot = await models.Slot.findByPk(slot_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!slot || slot.status !== "Free") {
      throw new ApiError(409, "The offered slot is no longer available.");
    }

    // 4. Create the reservation
    const reservationData = {
      facility_id: slot.facility_id,
      start_time: waitlistEntry.desired_start_time,
      end_time: waitlistEntry.desired_end_time,
      requests: [{ slot_type: slot.slot_type, count: 1 }],
    };
    const createdReservations = await createReservation(
      userId,
      reservationData,
      t
    );

    // 5. Fulfill the waitlist entry
    waitlistEntry.status = "Fulfilled";
    await waitlistEntry.save({ transaction: t });

    // The createReservation function already returns the reservation and slot
    return createdReservations;
  });
};

export const reservationService = {
  createReservation,
  getReservationsByUserId,
  getReservationById,
  getReservationsByFacilityId,
  cancelReservationById,
  checkInReservationById,
  checkOutReservationById,
  createReservationFromWaitlist,
};
