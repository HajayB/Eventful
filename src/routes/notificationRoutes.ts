import { Router } from "express";
import { createReminderController,fetchUserReminders } from "../controllers/notificationController";
import { requireAuth } from "../middlewares/requireAuth";
import { validateRequest } from "../middlewares/validateRequest";
import { createReminderSchema } from "../validation/notificationValidation";

const router = Router();

router.post(
  "/reminder",
  requireAuth,
  validateRequest(createReminderSchema),
  createReminderController
);

router.get(
  "/reminder/me",
  requireAuth,
  validateRequest(createReminderSchema),
  fetchUserReminders
);
export default router;
