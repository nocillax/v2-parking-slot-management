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

export const slotService = {
  createSlots,
};
