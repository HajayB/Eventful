import { Router } from "express";
import {
  registerController,
  loginController,
} from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import {
  registerSchema,
  loginSchema,
} from "../validation/authValidation";
import { createRateLimiter } from "../middlewares/rateLimiter";

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

export default router;
