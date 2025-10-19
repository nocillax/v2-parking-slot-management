import Joi from "joi";

const slotSchema = Joi.object({
  slot_type: Joi.string()
    .valid("Normal", "VIP", "Handicapped", "Bike")
    .default("Normal"),
  hourly_rate: Joi.number().min(0).optional().allow(null),
  location_tag: Joi.string().optional(),
});

const createSlots = {
  params: Joi.object().keys({
    facilityId: Joi.string().uuid().required(),
  }),
  // Allow either a single object or an array of objects
  body: Joi.alternatives().try(slotSchema, Joi.array().items(slotSchema)),
};

const getSlots = {
  params: Joi.object().keys({
    facilityId: Joi.string().uuid().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    status: Joi.string().valid("Free", "Reserved", "Occupied"),
    slot_type: Joi.string().valid("Normal", "VIP", "Handicapped", "Bike"),
  }),
};

const getSlot = {
  params: Joi.object().keys({
    facilityId: Joi.string().uuid().required(),
    slotId: Joi.string().uuid().required(),
  }),
};

const updateSlot = {
  params: Joi.object().keys({
    facilityId: Joi.string().uuid().required(),
    slotId: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      hourly_rate: Joi.number().min(0),
      location_tag: Joi.string().allow(null, ""),
      slot_type: Joi.string().valid("Normal", "VIP", "Handicapped", "Bike"),
    })
    .min(1), // Require at least one field to be updated
};

const updateSlotStatus = {
  params: Joi.object().keys({
    facilityId: Joi.string().uuid().required(),
    slotId: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid("Free", "Reserved", "Occupied").required(),
  }),
};

const deleteSlot = {
  params: Joi.object().keys({
    facilityId: Joi.string().uuid().required(),
    slotId: Joi.string().uuid().required(),
  }),
};

export const slotValidator = {
  createSlots,
  getSlots,
  getSlot,
  updateSlot,
  updateSlotStatus,
  deleteSlot,
};
