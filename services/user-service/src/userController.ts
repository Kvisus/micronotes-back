import { asyncHandler } from "../../../shared/middleware";
import { UserService } from "./userService";
import { Request, Response } from "express";
import { createErrorResponse, createSuccessResponse } from "../../../shared/utils";

const userService = new UserService();

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    const profile = await userService.getUserProfile(userId);

    return res
      .status(200)
      .json(
        createSuccessResponse(profile, "User profile retrieved successfully")
      );
  }
);

export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    const profileData = req.body;
    const profile = await userService.updateUserProfile(userId, profileData);
    return res
      .status(200)
      .json(
        createSuccessResponse(profile, "User profile updated successfully")
      );
  }
);

export const deleteUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    await userService.deleteUserProfile(userId);
    return res
      .status(200)
      .json(createSuccessResponse(null, "User profile deleted successfully"));
  }
);
