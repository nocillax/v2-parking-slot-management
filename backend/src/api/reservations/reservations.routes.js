import { Router } from "express";
import { reservationController } from "./reservations.controller.js";
import { reservationValidator } from "./reservations.validator.js";
import { protect } from "#src/middleware/auth.middleware.js";
import { validate } from "#src/middleware/validate.middleware.js";

const router = Router();

router.post(
  "/",
  [protect, validate(reservationValidator.createReservation)],
  reservationController.createReservation
);

export default router;
