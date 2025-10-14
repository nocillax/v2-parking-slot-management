import models from "#models/index.js";
import { ApiError } from "#utils/ApiError.js";

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

export const slotService = {
  createSlots,
  getSlotsByFacility,
  getSlotById,
  updateSlotById,
  updateSlotStatus,
};
