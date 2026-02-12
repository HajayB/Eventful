import cron from "node-cron";
import { processPendingReminders } from "../services/notificationService";
import { connectDB } from "../config/db";

const startReminderCron = async () => {
  console.log("Worker is running...")
  await connectDB();
  console.log("MongoDB connected in worker");

  cron.schedule("*/1 * * * *", async () => {
    try {
      await processPendingReminders();
    } catch (err) {
      console.error("Reminder cron failed", err);
    }
  });
};

startReminderCron();
