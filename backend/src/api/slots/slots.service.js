import models from "#models/index.js";
import { ApiError } from "#utils/ApiError.js";
import { getSlotPrice } from "#utils/priceConfig.js";

const createSlots = async (facilityId, slotData, adminId) => {
  const facility = await models.Facility.findByPk(facilityId);

  if (!facility) {
    throw new ApiError(404, "Facility not found.");
  }

  // Ownership check
  if (facility.admin_id !== adminId) {
    throw new ApiError(
      403,
      "You are not authorized to add slots to this facility."
    );
  }

  const slotsToCreate = Array.isArray(slotData) ? slotData : [slotData];

  const createdSlots = await models.Slot.bulkCreate(
    slotsToCreate.map((slot) => ({
      ...slot,
      facility_id: facilityId,
      hourly_rate: getSlotPrice(slot.slot_type), // Auto-set price based on type
    }))
  );

  return createdSlots;
};

const getSlotsByFacility = async (facilityId, options) => {
  const { page = 1, limit = 20, status, slot_type } = options;

  const where = { facility_id: facilityId };

  if (status) {
    where.status = status;
  }

  if (slot_type) {
    where.slot_type = slot_type;
  }

  return await models.Slot.findAndCountAll({
    where,
    order: [["location_tag", "ASC"]],
    limit,
    offset: (page - 1) * limit,
  });
};

const getSlotById = async (facilityId, slotId) => {
  const slot = await models.Slot.findOne({
    where: {
      id: slotId,
      facility_id: facilityId, // Ensure slot belongs to the facility
    },
  });
  return slot;
};

const updateSlotById = async (facilityId, slotId, updateData, adminId) => {
  const slot = await getSlotById(facilityId, slotId);
  if (!slot) {
    throw new ApiError(404, "Slot not found in this facility.");
  }

  const facility = await slot.getFacility();
  if (facility.admin_id !== adminId) {
    throw new ApiError(403, "You are not authorized to update this slot.");
  }

  // Safety check: prevent changing type of a non-free slot
  if (updateData.slot_type && slot.status !== "Free") {
    throw new ApiError(
      400,
      `Cannot change slot type. Slot is currently in '${slot.status}' status.`
    );
  }

  Object.assign(slot, updateData);
  await slot.save();
  return slot;
};

const updateSlotStatus = async (facilityId, slotId, status, adminId) => {
  const slot = await getSlotById(facilityId, slotId);
  if (!slot) {
    throw new ApiError(404, "Slot not found in this facility.");
  }

  const facility = await slot.getFacility();
  if (facility.admin_id !== adminId) {
    throw new ApiError(
      403,
      "You are not authorized to update this slot's status."
    );
  }

  slot.status = status;
  await slot.save();
  return slot;
};

const getSlotsWithAvailability = async (
  facilityId,
  startTime,
  endTime,
  options
) => {
  const { page = 1, limit = 20, status, slot_type } = options;

  // First get all slots
  const allSlots = await models.Slot.findAll({
    where: {
      facility_id: facilityId,
      ...(slot_type && { slot_type }),
      ...(status && { status }),
    },
    order: [["location_tag", "ASC"]],
  });

  // Check availability for each slot
  const slotsWithAvailability = await Promise.all(
    allSlots.map(async (slot) => {
      const isAvailable = await checkSlotAvailability(
        slot.id,
        startTime,
        endTime
      );
      return {
        ...slot.toJSON(),
        is_available: isAvailable,
        availability_status: isAvailable ? "Available" : "Reserved",
      };
    })
  );

  // Apply pagination
  const offset = (page - 1) * limit;
  const paginatedSlots = slotsWithAvailability.slice(offset, offset + limit);

  return {
    count: slotsWithAvailability.length,
    rows: paginatedSlots,
  };
};

const checkSlotAvailability = async (slotId, startTime, endTime) => {
  const conflictingReservations = await models.Reservation.findAll({
    where: {
      slot_id: slotId,
      status: { [Op.notIn]: ["Cancelled", "Expired", "Completed"] },
      [Op.or]: [
        { start_time: { [Op.between]: [startTime, endTime] } },
        { end_time: { [Op.between]: [startTime, endTime] } },
        {
          [Op.and]: [
            { start_time: { [Op.lte]: startTime } },
            { end_time: { [Op.gte]: endTime } },
          ],
        },
      ],
    },
  });

  return conflictingReservations.length === 0;
};

const deleteSlotById = async (facilityId, slotId, adminId) => {
  const slot = await getSlotById(facilityId, slotId);
  if (!slot) {
    throw new ApiError(404, "Slot not found in this facility.");
  }

  const facility = await slot.getFacility();
  if (facility.admin_id !== adminId) {
    throw new ApiError(403, "You are not authorized to delete this slot.");
  }

  // Safety check: only allow deletion of free slots
  if (slot.status !== "Free") {
    throw new ApiError(
      400,
      `Cannot delete slot. It is currently in '${slot.status}' status.`
    );
  }

  await slot.destroy();
};

export const slotService = {
  createSlots,
  getSlotsByFacility,
  getSlotsWithAvailability,
  getSlotById,
  updateSlotById,
  updateSlotStatus,
  deleteSlotById,
};
