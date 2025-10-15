import { Router } from "express";
import { reservationController } from "./reservations.controller.js";
import { reservationValidator } from "./reservations.validator.js";
import { protect, authorize } from "#src/middleware/auth.middleware.js";
import { validate } from "#src/middleware/validate.middleware.js";

const router = Router();

router.post(
  "/",
  [protect, validate(reservationValidator.createReservation)],
  reservationController.createReservation
);

router.get(
  "/me",
  [protect, validate(reservationValidator.getUserReservations)],
  reservationController.getUserReservations
);

router.get(
  "/:id",
  [protect, validate(reservationValidator.getReservation)],
  reservationController.getReservation
);

router.patch(
  "/:id/cancel",
  [protect, validate(reservationValidator.cancelReservation)],
  reservationController.cancelReservation
);

router.patch(
  "/:id/check-in",
  [
    protect,
    authorize("admin"),
    validate(reservationValidator.checkInReservation),
  ],
  reservationController.checkInReservation
);

router.patch(
  "/:id/check-out",
  [
    protect,
    authorize("admin"),
    validate(reservationValidator.checkOutReservation),
  ],
  reservationController.checkOutReservation
);

router.post(
  "/from-waitlist",
  [protect, validate(reservationValidator.createFromWaitlist)],
  reservationController.createFromWaitlist
);

export default router;
