import { Router } from "express";
import { areaController } from "./areas.controller.js";
import { areaValidator } from "./areas.validator.js";
import { validate } from "#src/middleware/validate.middleware.js";

const router = Router();

router
  .route("/")
  .get(validate(areaValidator.getAreas), areaController.getAreas);

router
  .route("/:areaId")
  .get(validate(areaValidator.getArea), areaController.getArea);

export default router;
