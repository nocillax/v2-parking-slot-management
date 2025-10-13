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

export const facilityValidator = {
  createFacility,
};
