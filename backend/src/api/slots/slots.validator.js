import Joi from "joi";

const slotSchema = Joi.object({
  slot_type: Joi.string()
    .valid("Normal", "VIP", "Handicapped")
    .default("Normal"),
  hourly_rate: Joi.number().min(0).required(),
  location_tag: Joi.string().optional(),
});

const createSlots = {
  params: Joi.object().keys({
    facilityId: Joi.string().uuid().required(),
  }),
  // Allow either a single object or an array of objects
  body: Joi.alternatives().try(slotSchema, Joi.array().items(slotSchema)),
};

export const slotValidator = {
  createSlots,
};
