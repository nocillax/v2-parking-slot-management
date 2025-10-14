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

router.get("/", validate(slotValidator.getSlots), slotController.getSlots);
router.get("/:slotId", validate(slotValidator.getSlot), slotController.getSlot);

router.patch(
  "/:slotId",
  [protect, authorize("admin"), validate(slotValidator.updateSlot)],
  slotController.updateSlot
);

router.patch(
  "/:slotId/status",
  [protect, authorize("admin"), validate(slotValidator.updateSlotStatus)],
  slotController.updateSlotStatus
);

router.delete(
  "/:slotId",
  [protect, authorize("admin"), validate(slotValidator.deleteSlot)],
  slotController.deleteSlot
);

export default router;
