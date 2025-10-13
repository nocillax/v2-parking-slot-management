import { Router } from "express";
import { notificationController } from "./notifications.controller.js";
import { notificationValidator } from "./notifications.validator.js";
import { protect } from "#src/middleware/auth.middleware.js";
import { validate } from "#src/middleware/validate.middleware.js";

const { NODE_ENV } = process.env;

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

router.patch("/read-all", protect, notificationController.markAllAsRead);

router.delete(
  "/:notificationId",
  [protect, validate(notificationValidator.deleteNotification)],
  notificationController.deleteNotification
);

// This temporary route for generating test data will only be available in development mode
if (NODE_ENV === "development") {
  router.post(
    "/generate-test",
    protect,
    notificationController.generateTestNotifications
  );
}

export default router;
