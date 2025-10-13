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

export default router;
