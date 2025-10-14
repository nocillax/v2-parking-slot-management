import Joi from "joi";

const createFacility = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    area_id: Joi.string().uuid().required(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
  }),
};

const getFacilities = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    sortBy: Joi.string().valid(
      "createdAt:desc",
      "createdAt:asc",
      "available_slots:desc",
      "available_slots:asc"
    ),
    search: Joi.string(),
    area_id: Joi.string().uuid(),
    district_id: Joi.string().uuid(),
    division_id: Joi.string().uuid(),
    admin_id: Joi.string().uuid(),
  }),
};

const getFacility = {
  params: Joi.object().keys({
    facilityId: Joi.string().uuid().required(),
  }),
};

const updateFacility = {
  params: Joi.object().keys({
    facilityId: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      address: Joi.string(),
      area_id: Joi.string().uuid(),
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
    })
    .min(1), // Require at least one field to be updated
};

export const facilityValidator = {
  createFacility,
  getFacilities,
  getFacility,
  updateFacility,
};
