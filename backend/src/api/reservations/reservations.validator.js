import Joi from "joi";

const reservationRequestSchema = Joi.object({
  slot_type: Joi.string()
    .valid("Normal", "VIP", "Handicapped", "Bike")
    .required(),
  count: Joi.number().integer().min(1).required(),
});

const createReservation = {
  body: Joi.object({
    facility_id: Joi.string().uuid().required(),
    start_time: Joi.date().iso().required(), // Allow any time, validation will be in service
    end_time: Joi.date().iso().greater(Joi.ref("start_time")).required(),
    requests: Joi.array().items(reservationRequestSchema).min(1).required(),
  }),
};

const getUserReservations = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    status: Joi.string().valid(
      "Active",
      "Checked-in",
      "Completed",
      "Expired",
      "Overstayed",
      "Cancelled"
    ),
    slot_type: Joi.string().valid("Normal", "VIP", "Handicapped", "Bike"),
    sortBy: Joi.string().valid("start_time:asc", "start_time:desc"),
  }),
};

const getReservation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

const getFacilityReservations = {
  params: Joi.object({
    facilityId: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    status: Joi.string().valid(
      "Active",
      "Checked-in",
      "Completed",
      "Expired",
      "Overstayed",
      "Cancelled"
    ),
    sortBy: Joi.string().valid("start_time:asc", "start_time:desc"),
    user_id: Joi.string().uuid(), // Allow admin to filter by a specific user
  }),
};

const cancelReservation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({}),
};

const checkInReservation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    vehicle_number: Joi.string().required(),
  }),
};

const checkOutReservation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({}), // Explicitly state that the body should be an empty object
};

const createFromWaitlist = {
  body: Joi.object({
    waitlist_id: Joi.string().uuid().required(),
  }),
};

export const reservationValidator = {
  createReservation,
  getUserReservations,
  getReservation,
  getFacilityReservations,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  createFromWaitlist,
};
