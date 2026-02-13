import cron from "node-cron";
import { processPendingReminders } from "../services/notificationService";
import mongoose from "mongoose";

const startReminderCron = async () => {
 const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI!);
      console.log("MongoDB connected");
    } catch (error) {
      console.error("Mongo connection error", error);
      process.exit(1);
    }
  };
  await connectDB();

  cron.schedule("*/1 * * * *", async () => {
    try {
      await processPendingReminders();
    } catch (err) {
      console.error("Reminder cron failed", err);
    }
  });
};

startReminderCron();
