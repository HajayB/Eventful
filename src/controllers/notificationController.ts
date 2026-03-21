import { Request, Response } from "express";
import { createEventReminder, getUserReminders } from "../services/notificationService";
import { sendContactEmail } from "../services/emailService";
/**
 * CREATE EVENT REMINDER
 * POST /notifications/reminder
 */
export const createReminderController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId.toString();
    const email = req.user!.email; 
    const { eventId, remindAt } = req.body;

    if (!eventId || !remindAt) {
      return res.status(400).json({
        message: "eventId and remindAt are required",
      });
    }

    const reminder = await createEventReminder({
      userId,
      email,
      eventId,
      remindAt: new Date(remindAt),
    });

    res.status(201).json({
      message: "Reminder set successfully",
      reminder,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to create reminder",
    });
  }
};

/**
 * GET EVENT REMINDER
 * GET /notifications/reminder/me
 */
export const fetchUserReminders = async (req: Request, res: Response) => {
  const userId = req.user!.userId.toString();
  

  const reminders = await getUserReminders(userId);

  res.json({
    message: "Reminders fetched successfully",
    reminders,
  });
};


export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    await sendContactEmail({ name, email, message });

    return res.status(200).json({
      message: "Message sent successfully. Check your email ✉️",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Failed to send message",
    });
  }
};