import { Router } from "express";
import {
  deleteUserProfile,
  getUserProfile,
  updateUserProfile,
} from "./userController";
import { authenticateToken, validateRequest } from "../../../shared/middleware";
import { updateProfileSchema } from "./validation";

const router = Router();

// protected routes
router.get("/profile", authenticateToken, getUserProfile);
router.put(
  "/profile",
  authenticateToken,
  validateRequest(updateProfileSchema),
  updateUserProfile
);
router.delete("/profile", authenticateToken, deleteUserProfile);

export default router;
