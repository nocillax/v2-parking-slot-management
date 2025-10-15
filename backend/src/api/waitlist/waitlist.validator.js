import Joi from "joi";

const joinWaitlist = {
  params: Joi.object({
    facilityId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    slot_type_pref: Joi.string()
      .valid("Normal", "VIP", "Handicapped", "Bike")
      .required(),
    desired_start_time: Joi.date().iso().min("now").required(),
    desired_end_time: Joi.date()
      .iso()
      .greater(Joi.ref("desired_start_time"))
      .required(),
  }),
};

const getUserWaitlists = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    status: Joi.string().valid(
      "Active",
      "Notified",
      "Fulfilled",
      "Expired",
      "Cancelled"
    ),
  }),
};

const cancelWaitlist = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const waitlistValidator = {
  joinWaitlist,
  getUserWaitlists,
  cancelWaitlist,
};
