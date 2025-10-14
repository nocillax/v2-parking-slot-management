import { Router } from "express";
import { facilityController } from "./facilities.controller.js";
import { facilityValidator } from "./facilities.validator.js";
import { protect, authorize } from "#src/middleware/auth.middleware.js";
import { validate } from "#src/middleware/validate.middleware.js";
import slotRoutes from "../slots/slots.routes.js";
import { reservationController } from "../reservations/reservations.controller.js";
import { reservationValidator } from "../reservations/reservations.validator.js";

const router = Router();

// Nest the slot routes
// Any request to /api/v1/facilities/:facilityId/slots... will be handled by slotRoutes
router.use("/:facilityId/slots", slotRoutes);

// Admin route to get all reservations for a facility
router.get(
  "/:facilityId/reservations",
  [
    protect,
    authorize("admin"),
    validate(reservationValidator.getFacilityReservations),
  ],
  reservationController.getFacilityReservations
);

router
  .route("/")
  .post(
    [protect, authorize("admin"), validate(facilityValidator.createFacility)],
    facilityController.createFacility
  )
  .get(
    validate(facilityValidator.getFacilities),
    facilityController.getFacilities
  );

router
  .route("/:facilityId")
  .get(validate(facilityValidator.getFacility), facilityController.getFacility)
  .patch(
    [protect, authorize("admin"), validate(facilityValidator.updateFacility)],
    facilityController.updateFacility
  )
  .delete(
    [protect, authorize("admin"), validate(facilityValidator.deleteFacility)],
    facilityController.deleteFacility
  );

export default router;
