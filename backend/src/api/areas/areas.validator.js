import Joi from "joi";

export const areaValidator = {
  getAreas: {
    query: Joi.object().keys({
      district_id: Joi.string().uuid(),
      division_id: Joi.string().uuid(),
      search: Joi.string().min(1).max(100),
      popular: Joi.string().valid("true", "false"),
      limit: Joi.number().integer().min(1).max(100),
      offset: Joi.number().integer().min(0),
    }),
  },

  getArea: {
    params: Joi.object().keys({
      areaId: Joi.string().uuid().required(),
    }),
  },
};
