import { Router } from "express";
import { notificationController } from "./notifications.controller.js";
import { notificationValidator } from "./notifications.validator.js";
import { protect } from "#src/middleware/auth.middleware.js";
import { validate } from "#src/middleware/validate.middleware.js";

const router = Router();

router.get(
  "/",
  [protect, validate(notificationValidator.getNotifications)],
  notificationController.getNotifications
);

router.patch(
  "/:notificationId/read",
  [protect, validate(notificationValidator.markAsRead)],
  notificationController.markAsRead
);

/* A temporary route for developers to generate test data */
router.post(
  "/generate-test",
  protect,
  notificationController.generateTestNotifications
);

export default router;
