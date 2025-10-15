import { Router } from "express";
import { divisionController } from "./divisions.controller.js";
import { divisionValidator } from "./divisions.validator.js";
import { validate } from "#src/middleware/validate.middleware.js";

const router = Router();

router
  .route("/")
  .get(
    validate(divisionValidator.getDivisions),
    divisionController.getDivisions
  );

router
  .route("/:divisionId")
  .get(validate(divisionValidator.getDivision), divisionController.getDivision);

export default router;
