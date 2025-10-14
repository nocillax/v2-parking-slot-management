import models from "#models/index.js";
import { Op } from "sequelize";
import { ApiError } from "#utils/ApiError.js";

const createFacility = async (facilityData, adminId) => {
  const facility = await models.Facility.create({
    ...facilityData,
    admin_id: adminId,
  });
  return facility;
};

const getFacilities = async (options) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt:desc",
    search,
    area_id,
    district_id,
    division_id,
    admin_id,
  } = options;

  const where = {};
  const include = [];

  if (search) {
    where.name = { [Op.iLike]: `%${search}%` };
  }

  if (admin_id) {
    where.admin_id = admin_id;
  }

  // Build include hierarchy for location filtering
  const areaInclude = { model: models.Area, as: "area", where: {} };
  if (area_id) areaInclude.where.id = area_id;

  const districtInclude = { model: models.District, as: "district", where: {} };
  if (district_id) districtInclude.where.id = district_id;

  const divisionInclude = { model: models.Division, as: "division", where: {} };
  if (division_id) divisionInclude.where.id = division_id;

  if (district_id || division_id) areaInclude.include = [districtInclude];
  if (division_id) districtInclude.include = [divisionInclude];
  include.push(areaInclude);

  const [sortField, sortOrder] = sortBy.split(":");

  return await models.Facility.findAndCountAll({
    where,
    include,
    order: [[sortField, sortOrder.toUpperCase()]],
    limit,
    offset: (page - 1) * limit,
  });
};

const getFacilityById = async (facilityId) => {
  const facility = await models.Facility.findByPk(facilityId, {
    include: [
      {
        model: models.Area,
        as: "area",
        include: [{ model: models.District, as: "district" }],
      },
      { model: models.User, as: "admin", attributes: ["id", "name", "email"] },
    ],
  });
  return facility;
};

const updateFacilityById = async (facilityId, updateData, adminId) => {
  const facility = await models.Facility.findByPk(facilityId);

  if (!facility) {
    throw new ApiError(404, "Facility not found.");
  }

  // Ownership check
  if (facility.admin_id !== adminId) {
    throw new ApiError(403, "You are not authorized to update this facility.");
  }

  Object.assign(facility, updateData);
  await facility.save();
  return facility;
};

const deleteFacilityById = async (facilityId, adminId) => {
  const facility = await models.Facility.findByPk(facilityId);

  if (!facility) {
    throw new ApiError(404, "Facility not found.");
  }

  // Ownership check
  if (facility.admin_id !== adminId) {
    throw new ApiError(403, "You are not authorized to delete this facility.");
  }

  // Prevent deletion if slots exist
  const slotCount = await models.Slot.count({
    where: { facility_id: facilityId },
  });
  if (slotCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete facility. It has ${slotCount} associated slots. Please delete them first.`
    );
  }

  await facility.destroy();
};

export const facilityService = {
  createFacility,
  getFacilities,
  getFacilityById,
  updateFacilityById,
  deleteFacilityById,
};
