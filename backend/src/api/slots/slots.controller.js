import asyncHandler from "express-async-handler";
import httpStatus from "http-status-codes";
import { slotService } from "./slots.service.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { ApiError } from "#utils/ApiError.js";

const createSlots = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const adminId = req.user.id;
  const slots = await slotService.createSlots(facilityId, req.body, adminId);

  res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(
        httpStatus.CREATED,
        slots,
        "Slot(s) created successfully."
      )
    );
});

const getSlots = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const slots = await slotService.getSlotsByFacility(facilityId, req.query);

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, slots));
});

const getSlot = asyncHandler(async (req, res) => {
  const { facilityId, slotId } = req.params;
  const slot = await slotService.getSlotById(facilityId, slotId);

  if (!slot) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Slot not found in this facility."
    );
  }

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, slot));
});

export const slotController = {
  createSlots,
  getSlots,
  getSlot,
};
