import models from "#models/index.js";
import { ApiError } from "#utils/ApiError.js";
import { notificationService } from "#services/notification.service.js";

const joinWaitlist = async (userId, facilityId, waitlistData) => {
  // 1. Check if the facility exists
  const facility = await models.Facility.findByPk(facilityId);
  if (!facility) {
    throw new ApiError(404, "Facility not found.");
  }

  // 2. Prevent user from joining the same waitlist multiple times
  const existingEntry = await models.Waitlist.findOne({
    where: {
      user_id: userId,
      facility_id: facilityId,
      status: "Active",
    },
  });

  if (existingEntry) {
    throw new ApiError(
      409,
      "You are already on the active waitlist for this facility."
    );
  }

  // 3. Create the waitlist entry
  const newWaitlistEntry = await models.Waitlist.create({
    user_id: userId,
    facility_id: facilityId,
    ...waitlistData,
  });

  return newWaitlistEntry;
};

const getWaitlistsByUserId = async (userId, options) => {
  const { page = 1, limit = 10, status } = options;

  const where = { user_id: userId };
  if (status) {
    where.status = status;
  }

  return await models.Waitlist.findAndCountAll({
    where,
    include: [
      { model: models.Facility, as: "facility", attributes: ["id", "name"] },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });
};

const cancelWaitlistEntry = async (waitlistId, userId) => {
  const waitlistEntry = await models.Waitlist.findOne({
    where: { id: waitlistId, user_id: userId },
  });

  if (!waitlistEntry) {
    throw new ApiError(
      404,
      "Waitlist entry not found or you do not have permission to cancel it."
    );
  }

  await waitlistEntry.cancel();
  return waitlistEntry;
};

const processNextInQueue = async (freedSlot) => {
  // Find the highest priority, oldest entry for the freed slot's type and facility
  const nextInLine = await models.Waitlist.findOne({
    where: {
      facility_id: freedSlot.facility_id,
      slot_type_pref: freedSlot.slot_type,
      status: "Active",
    },
    order: [
      ["priority", "DESC"],
      ["createdAt", "ASC"],
    ],
  });

  if (!nextInLine) {
    console.log(
      `No active waitlist entries for ${freedSlot.slot_type} at facility ${freedSlot.facility_id}.`
    );
    return;
  }

  // Notify the user
  const facility = await freedSlot.getFacility();
  await notificationService.waitlistSlotAvailable(nextInLine.user_id, {
    waitlist_id: nextInLine.id,
    slot_id: freedSlot.id,
    slot_type: freedSlot.slot_type,
    lot_name: facility.name,
    start_time: nextInLine.desired_start_time,
  });

  // Update the waitlist entry status
  const notificationMinutes = 5;
  nextInLine.status = "Notified";
  nextInLine.notified_at = new Date();
  nextInLine.notification_expires_at = new Date(
    Date.now() + notificationMinutes * 60 * 1000
  );
  await nextInLine.save();

  console.log(
    `Notified user ${nextInLine.user_id} for available slot ${freedSlot.id}.`
  );
};

export const waitlistService = {
  joinWaitlist,
  getWaitlistsByUserId,
  cancelWaitlistEntry,
  processNextInQueue,
};
