import Joi from "joi";

const reservationRequestSchema = Joi.object({
  slot_type: Joi.string()
    .valid("Normal", "VIP", "Handicapped", "Motorbike")
    .required(),
  count: Joi.number().integer().min(1).required(),
});

const createReservation = {
  body: Joi.object({
    facility_id: Joi.string().uuid().required(),
    start_time: Joi.date().iso().required(),
    end_time: Joi.date().iso().greater(Joi.ref("start_time")).required(),
    requests: Joi.array().items(reservationRequestSchema).min(1).required(),
  }),
};

export const reservationValidator = {
  createReservation,
};
