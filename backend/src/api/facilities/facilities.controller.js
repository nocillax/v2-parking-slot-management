import asyncHandler from "express-async-handler";
import httpStatus from "http-status-codes";
import { facilityService } from "./facilities.service.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { ApiError } from "#utils/ApiError.js";

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

const getFacilities = asyncHandler(async (req, res) => {
  const facilities = await facilityService.getFacilities(req.query);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, facilities));
});

const getFacility = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const facility = await facilityService.getFacilityById(facilityId);

  if (!facility) {
    throw new ApiError(httpStatus.NOT_FOUND, "Facility not found.");
  }

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, facility));
});

const updateFacility = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const adminId = req.user.id;
  const updatedFacility = await facilityService.updateFacilityById(
    facilityId,
    req.body,
    adminId
  );
  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        updatedFacility,
        "Facility updated successfully."
      )
    );
});

const deleteFacility = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const adminId = req.user.id;
  await facilityService.deleteFacilityById(facilityId, adminId);
  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, null, "Facility deleted successfully.")
    );
});

export const facilityController = {
  createFacility,
  getFacilities,
  getFacility,
  updateFacility,
  deleteFacility,
};
