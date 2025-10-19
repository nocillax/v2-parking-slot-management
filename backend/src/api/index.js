import { Router } from "express";
import authRoutes from "./auth/auth.routes.js";
import notificationRoutes from "./notifications/notifications.routes.js";
import facilityRoutes from "./facilities/facilities.routes.js";
import reservationRoutes from "./reservations/reservations.routes.js";
import {
  // userRouter, // This was causing the conflict
  userRouter as waitlistUserRoutes,
} from "./waitlist/waitlist.routes.js";
import divisionRoutes from "./divisions/divisions.routes.js";
import districtRoutes from "./districts/districts.routes.js";
import areaRoutes from "./areas/areas.routes.js";
import userRoutes from "./users/user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/notifications", notificationRoutes);
router.use("/facilities", facilityRoutes);
router.use("/reservations", reservationRoutes);
router.use("/waitlist", waitlistUserRoutes);
router.use("/divisions", divisionRoutes);
router.use("/districts", districtRoutes);
router.use("/areas", areaRoutes);
router.use("/users", userRoutes);

export default router;
