import models from "#models/index.js";

const createFacility = async (facilityData, adminId) => {
  const facility = await models.Facility.create({
    ...facilityData,
    admin_id: adminId,
  });
  return facility;
};

export const facilityService = {
  createFacility,
};
