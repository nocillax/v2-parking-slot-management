import asyncHandler from "express-async-handler";
import httpStatus from "http-status-codes";
import { facilityService } from "./facilities.service.js";
import { ApiResponse } from "#utils/ApiResponse.js";

const createFacility = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const facility = await facilityService.createFacility(req.body, adminId);

  res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(
        httpStatus.CREATED,
        facility,
        "Facility created successfully."
      )
    );
});

export const facilityController = {
  createFacility,
};
