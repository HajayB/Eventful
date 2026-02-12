
import { Request, Response } from "express";
import {
  initializePayment,
  handlePaystackWebhook,
} from "../services/paymentService";
import { Payment } from "../models/paymentModel";
import { Ticket } from "../models/ticketModel";
import { Event } from "../models/eventModel";
import { sendTicketsEmail } from "../services/emailService";

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
};
