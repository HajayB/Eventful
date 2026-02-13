import cron from "node-cron";
import { processPendingReminders } from "../services/notificationService";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const startReminderCron = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Worker DB connected");
  } catch (error) {
    console.error("Mongo connection error", error);
    process.exit(1);
  }

  console.log("Reminder worker started...");

  cron.schedule("*/1 * * * *", async () => {
    try {
      await processPendingReminders();
    } catch (err) {
      console.error("Reminder cron failed", err);
    }
  });
};

startReminderCron();
