import { Router } from "express";
import authRoutes from "./auth/auth.routes.js";
import notificationRoutes from "./notifications/notifications.routes.js";
import facilityRoutes from "./facilities/facilities.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/notifications", notificationRoutes);
router.use("/facilities", facilityRoutes);

export default router;
