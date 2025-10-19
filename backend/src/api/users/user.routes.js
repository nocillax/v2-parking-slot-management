import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUsers,
} from "./user.controller.js";
import { protect, admin } from "#middleware/auth.middleware.js";
import { userValidator } from "./user.validator.js";
import { validate } from "#middleware/validator.middleware.js";

const router = express.Router();

router.use(protect, admin);

router
  .route("/")
  .get(getAllUsers)
  .post(validate(userValidator.createUser), createUser)
  .delete(validate(userValidator.deleteUsers), deleteUsers);

router.route("/:id").put(validate(userValidator.updateUser), updateUser);

export default router;
