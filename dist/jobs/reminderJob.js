"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const notificationService_1 = require("../services/notificationService");
const mongoose_1 = __importDefault(require("mongoose"));
const startReminderCron = async () => {
    const connectDB = async () => {
        try {
            await mongoose_1.default.connect(process.env.MONGO_URI);
            console.log("MongoDB connected");
        }
        catch (error) {
            console.error("Mongo connection error", error);
            process.exit(1);
        }
    };
    await connectDB();
    node_cron_1.default.schedule("*/1 * * * *", async () => {
        try {
            await (0, notificationService_1.processPendingReminders)();
        }
        catch (err) {
            console.error("Reminder cron failed", err);
        }
    });
};
startReminderCron();
