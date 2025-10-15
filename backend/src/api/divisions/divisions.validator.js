import Joi from "joi";

export const divisionValidator = {
  getDivisions: {
    query: Joi.object().keys({
      search: Joi.string().min(1).max(100),
      limit: Joi.number().integer().min(1).max(100),
      offset: Joi.number().integer().min(0),
    }),
  },

  getDivision: {
    params: Joi.object().keys({
      divisionId: Joi.string().uuid().required(),
    }),
  },
};
