import { Router } from "express";
import * as authController from "./authController";
import { authenticateToken, validateRequest } from "../../../shared/middleware";
import { loginSchema, refreshTokenSchema, registerSchema } from "./validation";

const router = Router();

//public routes
router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post(
  "/refresh",
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);
router.post(
  "/logout",
  validateRequest(refreshTokenSchema),
  authController.logout
);

// token validation for other services
router.get("/validate", authController.validateToken);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);
router.delete("/delete", authenticateToken, authController.deleteAccount);

export default router;
