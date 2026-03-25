import cron from "node-cron";
import { processPendingReminders } from "../services/notificationService";

export const startReminderJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Running reminder cron job... \n Worker is running...");
      await processPendingReminders();
    } catch (err) {
      console.error("Reminder cron failed", err);
    }
  });
};