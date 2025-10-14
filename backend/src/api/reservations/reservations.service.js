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

export const reservationService = {
  createReservation,
};
