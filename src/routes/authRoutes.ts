import { Router } from "express";
import {
  registerController,loginController,
  refreshController, logoutController,
  changePasswordController,sendResetLinkController,
  resetPasswordController
} from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import {
  registerSchema,
  loginSchema,
} from "../validation/authValidation";
import { createRateLimiter } from "../middlewares/rateLimiter";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post(
  "/register",
  createRateLimiter({ windowMs: 1 * 60 * 1000, max: 5 }),
  validateRequest(registerSchema),
  registerController
);

router.post(
  "/login",
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  validateRequest(loginSchema),
  loginController
);

router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.post("/change-password", requireAuth, changePasswordController);
router.post("/reset-password-link", createRateLimiter({windowMs: 1 * 60 * 1000, max: 3}),sendResetLinkController);
router.post("/reset-password", createRateLimiter({ windowMs: 1 * 60 * 1000, max: 5 }),  resetPasswordController);
// const token = new URLSearchParams(window.location.search).get("token");

export default router;
