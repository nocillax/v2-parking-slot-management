import { Router } from "express";
import { districtController } from "./districts.controller.js";
import { districtValidator } from "./districts.validator.js";
import { validate } from "#src/middleware/validate.middleware.js";

const router = Router();

router
  .route("/")
  .get(
    validate(districtValidator.getDistricts),
    districtController.getDistricts
  );

router
  .route("/:districtId")
  .get(validate(districtValidator.getDistrict), districtController.getDistrict);

export default router;
