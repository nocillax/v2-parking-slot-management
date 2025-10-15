import { Router } from "express";
import authRoutes from "./auth/auth.routes.js";
import notificationRoutes from "./notifications/notifications.routes.js";
import facilityRoutes from "./facilities/facilities.routes.js";
import reservationRoutes from "./reservations/reservations.routes.js";
import { userRouter as waitlistUserRoutes } from "./waitlist/waitlist.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/notifications", notificationRoutes);
router.use("/facilities", facilityRoutes);
router.use("/reservations", reservationRoutes);
router.use("/waitlist", waitlistUserRoutes);

export default router;
