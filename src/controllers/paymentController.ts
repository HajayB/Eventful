
import { Request, Response } from "express";
import {
  initializePayment,
  initializeGuestPayment,
  handlePaystackWebhook,
} from "../services/paymentService";
import { getUserPaymentHistory } from "../services/paymentHistoryService";
import { Payment } from "../models/paymentModel";
import { Ticket } from "../models/ticketModel";
import { Event } from "../models/eventModel";
import { sendTicketsEmail, sendGuestTicketsEmail } from "../services/emailService";

// GET /payments/history
export const paymentHistoryController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId.toString();
    const payments = await getUserPaymentHistory(userId);
    return res.status(200).json({ payments });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch payment history" });
  }
};

//initialize payment
export const initializePaymentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { eventId, quantity, email } = req.body;
    const userId = req.user!.userId.toString();

    const result = await initializePayment({
      eventId,
      quantity,
      email,
      userId,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Payment initialization failed",
    });
  }
};

// GUEST: initialize payment (no auth)
export const guestInitializePaymentController = async (req: Request, res: Response) => {
  try {
    const { eventId, quantity, email } = req.body;
    const result = await initializeGuestPayment({ eventId, quantity, email });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Guest payment initialization failed" });
  }
};

// GUEST: resend tickets by email + reference (no auth)
export const guestResendTicketsController = async (req: Request, res: Response) => {
  try {
    const { email, reference } = req.body;

    if (!email || !reference) {
      return res.status(400).json({ message: "Email and reference are required" });
    }

    const payment = await Payment.findOne({ reference, email: email.toLowerCase().trim(), status: "SUCCESS" });
    if (!payment) {
      return res.status(404).json({ message: "No paid ticket found for this email and reference" });
    }

    const tickets = await Ticket.find({ paymentRef: payment._id.toString() });
    if (!tickets.length) {
      return res.status(404).json({ message: "No tickets found" });
    }

    const event = await Event.findById(payment.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await sendGuestTicketsEmail({
      to: payment.email,
      event,
      tickets,
      reference: payment.reference,
      paymentId: payment._id.toString(),
    });

    return res.json({ message: "Tickets resent successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to resend tickets" });
  }
};

//PAYMENT WEBHOOKS

export const paystackWebhookController = async (
    req: Request,
    res: Response
  ) => {
    console.log("🔥 PAYSTACK WEBHOOK HIT");
    try {
      const signature = req.headers["x-paystack-signature"] as string;
  
      if (!signature) {
        return res.status(400).json({ message: "Missing signature" });
      }
      
      await handlePaystackWebhook({
        payload: req.body.toString(),
        signature,
      });
      console.log("✅ Webhook processed successfully");
      // Paystack requires 200 OK
      res.sendStatus(200);
    } catch (error) {
      // DO NOT expose errors to Paystack
      res.sendStatus(200);
    }
  };

//resend ticket
export const resendTickets = async (req:Request, res:Response) => {
  try {
    const { paymentRef } = req.params;

    const payment = await Payment.findOne({
      $or: [{ reference: paymentRef }, { _id: paymentRef }],
    });
    if (!payment || payment.status !== "SUCCESS") {
      return res.status(400).json({
        message: "Invalid or unpaid payment",
      });
    }

    const tickets = await Ticket.find({
      paymentRef: payment._id.toString(),
    });

    if (!tickets.length) {
      return res.status(404).json({
        message: "No tickets found for this payment",
      });
    }

    const event = await Event.findById(payment.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await sendTicketsEmail({
      to: payment.email,
      event,
      tickets,
      paymentId: payment._id.toString(),
    });

    return res.json({
      message: "Tickets resent successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to resend tickets" });
  }
};

