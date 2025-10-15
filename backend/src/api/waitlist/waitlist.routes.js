import { Router } from "express";
import { waitlistController } from "#api/waitlist/waitlist.controller.js";
import { waitlistValidator } from "#api/waitlist/waitlist.validator.js";
import { protect } from "#src/middleware/auth.middleware.js";
import { validate } from "#src/middleware/validate.middleware.js";

const facilityNestedRouter = Router({ mergeParams: true });
const userRouter = Router();

// Nested under facilities: POST /api/v1/facilities/:facilityId/waitlist
facilityNestedRouter.post(
  "/",
  [protect, validate(waitlistValidator.joinWaitlist)],
  waitlistController.joinWaitlist
);

userRouter.get(
  "/me",
  [protect, validate(waitlistValidator.getUserWaitlists)],
  waitlistController.getUserWaitlists
);

userRouter.delete(
  "/:id",
  [protect, validate(waitlistValidator.cancelWaitlist)],
  waitlistController.cancelWaitlist
);

export { facilityNestedRouter, userRouter };
