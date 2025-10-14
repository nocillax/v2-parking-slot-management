import { Router } from "express";
import { facilityController } from "./facilities.controller.js";
import { facilityValidator } from "./facilities.validator.js";
import { protect, authorize } from "#src/middleware/auth.middleware.js";
import { validate } from "#src/middleware/validate.middleware.js";

const router = Router();

router.post(
  "/",
  [protect, authorize("admin"), validate(facilityValidator.createFacility)],
  facilityController.createFacility
);

router.get(
  "/",
  validate(facilityValidator.getFacilities),
  facilityController.getFacilities
);

router.get(
  "/:facilityId",
  validate(facilityValidator.getFacility),
  facilityController.getFacility
);

router.patch(
  "/:facilityId",
  [protect, authorize("admin"), validate(facilityValidator.updateFacility)],
  facilityController.updateFacility
);

router.delete(
  "/:facilityId",
  [protect, authorize("admin"), validate(facilityValidator.getFacility)], // Re-use getFacility validator for params
  facilityController.deleteFacility
);

export default router;
