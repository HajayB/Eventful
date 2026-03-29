"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const notificationService_1 = require("../services/notificationService");
const startReminderJob = () => {
    node_cron_1.default.schedule("*/5 * * * *", async () => {
        try {
            console.log("Running reminder cron job... \n Worker is running...");
            await (0, notificationService_1.processPendingReminders)();
        }
        catch (err) {
            console.error("Reminder cron failed", err);
        }
    });
};
exports.startReminderJob = startReminderJob;
