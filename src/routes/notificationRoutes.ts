import { Router } from "express";
import { createReminderController,fetchUserReminders } from "../controllers/notificationController";
import { requireAuth } from "../middlewares/requireAuth";
import { validateRequest } from "../middlewares/validateRequest";
import { createReminderSchema } from "../validation/notificationValidation";
import { processPendingReminders } from "../services/notificationService";
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
  fetchUserReminders
);


router.post("/internal/run-reminders", async (req, res) => {
  const secret = req.headers["x-cron-secret"];

  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await processPendingReminders();
    return res.status(200).json({ message: "Reminders processed" });
  } catch (error) {
    console.error("Reminder execution failed", error);
    return res.status(500).json({ message: "Reminder job failed" });
  }
});

export default router;
