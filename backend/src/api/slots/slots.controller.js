import asyncHandler from "express-async-handler";
import httpStatus from "http-status-codes";
import { slotService } from "./slots.service.js";
import { ApiResponse } from "#utils/ApiResponse.js";

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

export const slotController = {
  createSlots,
};
