import asyncHandler from "express-async-handler";
import httpStatus from "http-status-codes";
import { waitlistService } from "#api/waitlist/waitlist.service.js";
import { ApiResponse } from "#utils/ApiResponse.js";

const joinWaitlist = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const userId = req.user.id;

  const waitlistEntry = await waitlistService.joinWaitlist(
    userId,
    facilityId,
    req.body
  );

  res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(
        httpStatus.CREATED,
        waitlistEntry,
        "Successfully joined the waitlist."
      )
    );
});

const getUserWaitlists = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const waitlistEntries = await waitlistService.getWaitlistsByUserId(
    userId,
    req.query
  );
  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, waitlistEntries));
});

const cancelWaitlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const cancelledEntry = await waitlistService.cancelWaitlistEntry(id, userId);

  res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        cancelledEntry,
        "Successfully removed from the waitlist."
      )
    );
});

export const waitlistController = {
  joinWaitlist,
  getUserWaitlists,
  cancelWaitlist,
};
