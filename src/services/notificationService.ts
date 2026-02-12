import { Types } from "mongoose";
import { Notification } from "../models/notificationModel";
import { Event } from "../models/eventModel";
import { sendEmail } from "../notifications/emailProvider";

interface CreateReminderInput {
  userId: string;
  email: string;
  eventId: string;
  remindAt: Date;
}
//set reminder
export const createEventReminder = async ({
  userId,
  email,
  eventId,
  remindAt,
}: CreateReminderInput) => {

  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  if (remindAt >= event.startTime) {
    throw new Error("Reminder must be before event start time");
  }

  const reminder = await Notification.create({
    userId: new Types.ObjectId(userId),
    eventId: new Types.ObjectId(eventId),
    email,
    remindAt,
  });

  return reminder;
};
//check reminders
export const getUserReminders = async (userId: string) => {
  const reminders = await Notification.find({
    userId: new Types.ObjectId(userId),
  })
    .populate("eventId", "title location startTime")
    .sort({ createdAt: -1 });

    const formattedReminders =  reminders.map((reminder) => ({
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

//Send email 
export const processPendingReminders = async () => {
  const now = new Date();
  console.log("Worker is running...")
  const reminders = await Notification.find({
    remindAt: { $lte: now },
    isSent: false,
  }).populate("eventId");

  for (const reminder of reminders) {
    const event: any = reminder.eventId;

    await sendEmail({
      to: reminder.email,
      subject: `Reminder: ${event.title}`,
      html: `
        <h2>Event Reminder</h2>
        <p>Your event <strong>${event.title}</strong> is coming up.</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Starts at:</strong> ${new Date(
          event.startTime
        ).toLocaleString()}</p>
      `,
    });

    reminder.isSent = true;
    reminder.sentAt = new Date();
    await reminder.save();
  }
};
