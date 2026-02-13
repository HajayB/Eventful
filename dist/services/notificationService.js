"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPendingReminders = exports.getUserReminders = exports.createEventReminder = void 0;
const mongoose_1 = require("mongoose");
const notificationModel_1 = require("../models/notificationModel");
const eventModel_1 = require("../models/eventModel");
const emailProvider_1 = require("../notifications/emailProvider");
//set reminder
const createEventReminder = async ({ userId, email, eventId, remindAt, }) => {
    const event = await eventModel_1.Event.findById(eventId);
    if (!event) {
        throw new Error("Event not found");
    }
    if (remindAt >= event.startTime) {
        throw new Error("Reminder must be before event start time");
    }
    const reminder = await notificationModel_1.Notification.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        eventId: new mongoose_1.Types.ObjectId(eventId),
        email,
        remindAt,
    });
    return reminder;
};
exports.createEventReminder = createEventReminder;
//check reminders
const getUserReminders = async (userId) => {
    const reminders = await notificationModel_1.Notification.find({
        userId: new mongoose_1.Types.ObjectId(userId),
    })
        .populate("eventId", "title location startTime")
        .sort({ createdAt: -1 });
    const formattedReminders = reminders.map((reminder) => ({
        _id: reminder._id,
        email: reminder.email,
        remindAt: reminder.remindAt,
        event: reminder.eventId,
        isSent: reminder.isSent,
        sentAt: reminder.sentAt,
        status: reminder.isSent ? "SENT" : "PENDING",
    }));
    return formattedReminders;
};
exports.getUserReminders = getUserReminders;
//Send email 
const processPendingReminders = async () => {
    const now = new Date();
    console.log("Worker is running...");
    const reminders = await notificationModel_1.Notification.find({
        remindAt: { $lte: now },
        isSent: false,
    }).populate("eventId");
    for (const reminder of reminders) {
        const event = reminder.eventId;
        await (0, emailProvider_1.sendEmail)({
            to: reminder.email,
            subject: `Reminder: ${event.title}`,
            html: `
        <h2>Event Reminder</h2>
        <p>Your event <strong>${event.title}</strong> is coming up.</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Starts at:</strong> ${new Date(event.startTime).toLocaleString("en-NG", {
                timeZone: "Africa/Lagos",
                dateStyle: "full",
                timeStyle: "short",
            })}</p>
      `,
        });
        reminder.isSent = true;
        reminder.sentAt = new Date();
        await reminder.save();
    }
};
exports.processPendingReminders = processPendingReminders;
