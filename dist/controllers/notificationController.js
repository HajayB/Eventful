"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserReminders = exports.createReminderController = void 0;
const notificationService_1 = require("../services/notificationService");
/**
 * CREATE EVENT REMINDER
 * POST /notifications/reminder
 */
const createReminderController = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const email = req.user.email;
        const { eventId, remindAt } = req.body;
        if (!eventId || !remindAt) {
            return res.status(400).json({
                message: "eventId and remindAt are required",
            });
        }
        const reminder = await (0, notificationService_1.createEventReminder)({
            userId,
            email,
            eventId,
            remindAt: new Date(remindAt),
        });
        res.status(201).json({
            message: "Reminder set successfully",
            reminder,
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Failed to create reminder",
        });
    }
};
exports.createReminderController = createReminderController;
/**
 * GET EVENT REMINDER
 * GET /notifications/reminder/me
 */
const fetchUserReminders = async (req, res) => {
    const userId = req.user.userId.toString();
    const reminders = await (0, notificationService_1.getUserReminders)(userId);
    res.json({
        message: "Reminders fetched successfully",
        reminders,
    });
};
exports.fetchUserReminders = fetchUserReminders;
