import Joi from "joi";

export const districtValidator = {
  getDistricts: {
    query: Joi.object().keys({
      division_id: Joi.string().uuid(),
      search: Joi.string().min(1).max(100),
      limit: Joi.number().integer().min(1).max(100),
      offset: Joi.number().integer().min(0),
    }),
  },

  getDistrict: {
    params: Joi.object().keys({
      districtId: Joi.string().uuid().required(),
    }),
  },
};
