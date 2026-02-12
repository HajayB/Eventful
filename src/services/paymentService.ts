// src/services/paymentService.ts
import axios from "axios";
import crypto from "crypto";
import { Types } from "mongoose";
import { Event } from "../models/eventModel";
import { Payment } from "../models/paymentModel";
import { paystackConfig } from "../config/paystack";
import { issueTicketsAfterPayment } from "./ticketService";
import { sendTicketsEmail } from "./emailService";
interface InitializePaymentInput {
  eventId: string;
  userId: string;
  quantity: number;
  email: string;
}

export const initializePayment = async ({
  eventId,
  userId,
  quantity,
  email,
}: InitializePaymentInput) => {
  // 1. Validate event
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  if (event.ticketsSold + quantity > event.totalTickets) {
    throw new Error("Not enough tickets available");
  }

  // 2. Calculate amount (Paystack expects kobo)
  const amount = event.price * quantity * 100;

  // 3. Create payment record (PENDING)
  const reference = crypto.randomUUID();

  const payment = await Payment.create({
    userId: new Types.ObjectId(userId),
    eventId: event._id,
    quantity,
    amount: event.price * quantity,
    email,
    reference,
    status: "PENDING",
  });

  // 4. Initialize Paystack transaction
  const response = await axios.post(
    `${paystackConfig.baseUrl}/transaction/initialize`,
    {
      email,
      amount,
      reference,
      callback_url: paystackConfig.callback_url,
      metadata: {
        paymentId: payment._id.toString(),
        eventId: event._id.toString(),
      },
    },
    { headers: paystackConfig.headers }
  );

  return {
    authorizationUrl: response.data.data.authorization_url,
    reference,
  };
};

//WEBHOOKS LOGIC 
interface HandleWebhookInput {
    payload: any;
    signature: string;
  }
  
  export const handlePaystackWebhook = async ({
    payload,
    signature,
  }: HandleWebhookInput) => {
    // 1️⃣ Verify signature (payload is RAW STRING)
    const hash = crypto
      .createHmac("sha512", paystackConfig.secretKey)
      .update(payload)
      .digest("hex");
  
    if (hash !== signature) {
      throw new Error("Invalid Paystack signature");
    }
  
    // 2️⃣ Parse AFTER verification
    const parsedPayload = JSON.parse(payload);

    console.log("🧾 Metadata received:", parsedPayload.data.metadata);

  
    // 3️⃣ Only handle successful payments
    if (parsedPayload.event !== "charge.success") {
      console.log("ℹ️ Ignored event:", parsedPayload.event);
      return;
    }
  
    const { reference, metadata } = parsedPayload.data;
  
    console.log("🔎 Payment reference:", reference);
  
    // 4️⃣ Find payment
    const payment = await Payment.findOne({ reference });
  
    if (!payment) {
      console.log("❌ Payment not found for reference:", reference);
      return;
    }
  
    if (payment.status === "SUCCESS") {
      console.log("ℹ️ Payment already processed");
      return;
    }
  
    // 5️⃣ Mark payment successful
    payment.status = "SUCCESS";
    await payment.save();
  
    console.log("✅ Payment marked SUCCESS");
  
    // 6️⃣ Fetch event
    const event = await Event.findById(metadata.eventId);
    if (!event) {
      console.log("❌ Event not found:", metadata.eventId);
      return;
    }

    if (!metadata?.eventId) {
      console.log("❌ Missing eventId in metadata");
      return;
    }
  
    // 7️⃣ Issue tickets
    console.log("📦 Ticket quantity:", payment.quantity);

    let tickets;

    try {
      tickets = await issueTicketsAfterPayment({
        eventId: metadata.eventId,
        eventeeId: payment.userId.toString(),
        paymentRef: payment._id.toString(),
        quantity: payment.quantity,
      });
    } catch (err) {
      console.error("❌ Ticket issuance failed:", err);
      return;
    }
  
    console.log("🎟 Tickets created:", tickets.length);
  
    // 8️⃣ Send email
    await sendTicketsEmail({
      to: parsedPayload.data.customer.email,
      event,
      tickets,
      paymentId: payment._id.toString(),
    });
  
    console.log("📧 Ticket email sent");
  };
  