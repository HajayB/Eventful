// src/services/paymentService.ts
import axios from "axios";
import crypto from "crypto";
import { Types } from "mongoose";
import { Event } from "../models/eventModel";
import { Payment } from "../models/paymentModel";
import { paystackConfig } from "../config/paystack";
import { issueTicketsAfterPayment } from "./ticketService";
import { sendTicketsEmail, sendGuestTicketsEmail } from "./emailService";

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

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
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  if (event.ticketsSold + quantity > event.totalTickets) {
    throw new Error("Not enough tickets available");
  }

  if (quantity > event.maxTicketsPerPurchase) {
    throw new Error(`Maximum ${event.maxTicketsPerPurchase} tickets allowed per purchase`);
  }

  const amount = event.price * quantity * 100;
  const reference = crypto.randomUUID();

  const payment = await Payment.create({
    userId: new Types.ObjectId(userId),
    eventId: event._id,
    quantity,
    amount: event.price * quantity,
    email,
    reference,
    status: "PENDING",
    isGuest: false,
  });

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
        isGuest: false,
      },
    },
    { headers: paystackConfig.headers }
  );

  return {
    authorizationUrl: response.data.data.authorization_url,
    reference,
  };
};

// ── GUEST PAYMENT ──────────────────────────────────────────────────────────

interface InitializeGuestPaymentInput {
  eventId: string;
  quantity: number;
  email: string;
}

export const initializeGuestPayment = async ({
  eventId,
  quantity,
  email,
}: InitializeGuestPaymentInput) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  if (event.ticketsSold + quantity > event.totalTickets) {
    throw new Error("Not enough tickets available");
  }

  if (quantity > event.maxTicketsPerPurchase) {
    throw new Error(`Maximum ${event.maxTicketsPerPurchase} tickets allowed per purchase`);
  }

  const amount = event.price * quantity * 100;
  const reference = crypto.randomUUID();

  const payment = await Payment.create({
    eventId: event._id,
    quantity,
    amount: event.price * quantity,
    email,
    reference,
    status: "PENDING",
    isGuest: true,
  });

  const response = await axios.post(
    `${paystackConfig.baseUrl}/transaction/initialize`,
    {
      email,
      amount,
      reference,
      callback_url: `${FRONTEND_BASE_URL}/guest/callback`,
      metadata: {
        paymentId: payment._id.toString(),
        eventId: event._id.toString(),
        isGuest: true,
      },
    },
    { headers: paystackConfig.headers }
  );

  return {
    authorizationUrl: response.data.data.authorization_url,
    reference,
  };
};

// ── WEBHOOK ────────────────────────────────────────────────────────────────

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
  if (!metadata?.eventId) {
    console.log("❌ Missing eventId in metadata");
    return;
  }

  const event = await Event.findById(metadata.eventId);
  if (!event) {
    console.log("❌ Event not found:", metadata.eventId);
    return;
  }

  // 7️⃣ Issue tickets — eventeeId is null for guests
  console.log("📦 Ticket quantity:", payment.quantity);

  let tickets;
  try {
    tickets = await issueTicketsAfterPayment({
      eventId: metadata.eventId,
      eventeeId: payment.isGuest ? null : payment.userId?.toString() ?? null,
      paymentRef: payment._id.toString(),
      quantity: payment.quantity,
    });
  } catch (err) {
    console.error("❌ Ticket issuance failed:", err);
    return;
  }

  console.log("🎟 Tickets created:", tickets.length);

  // 8️⃣ Send email — different template for guests
  const customerEmail = parsedPayload.data.customer.email;

  if (payment.isGuest) {
    await sendGuestTicketsEmail({
      to: customerEmail,
      event,
      tickets,
      reference: payment.reference,
      paymentId: payment._id.toString(),
    });
  } else {
    await sendTicketsEmail({
      to: customerEmail,
      event,
      tickets,
      paymentId: payment._id.toString(),
    });
  }

  console.log("📧 Ticket email sent");
};
