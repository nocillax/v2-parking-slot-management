import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authValidator } from "./auth.validator.js";
import { validate } from "../../middleware/validate.middleware.js";
import { protect, authorize } from "../../middleware/auth.middleware.js";

const router = Router();
router.post(
  "/register",
  validate(authValidator.register),
  authController.register
);
router.post("/login", validate(authValidator.login), authController.login);

// Protected route
router.get("/me", protect, authController.getMe);

// Admin-only route for testing RBAC
router.get(
  "/test-admin",
  protect,
  authorize("admin"),
  authController.testAdmin
);

// Route to refresh the access token using the httpOnly cookie
router.post("/refresh-token", authController.refreshToken);

// Routes for password reset
router.post(
  "/forgot-password",
  validate(authValidator.forgotPassword),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(authValidator.resetPassword),
  authController.resetPassword
);

export default router;
