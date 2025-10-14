import { Router } from "express";
import { slotController } from "./slots.controller.js";
import { slotValidator } from "./slots.validator.js";
import { protect, authorize } from "#src/middleware/auth.middleware.js";
import { validate } from "#src/middleware/validate.middleware.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  [protect, authorize("admin"), validate(slotValidator.createSlots)],
  slotController.createSlots
);

export default router;
