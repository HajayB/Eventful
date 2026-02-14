"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaystackWebhook = exports.initializePayment = void 0;
// src/services/paymentService.ts
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = require("mongoose");
const eventModel_1 = require("../models/eventModel");
const paymentModel_1 = require("../models/paymentModel");
const paystack_1 = require("../config/paystack");
const ticketService_1 = require("./ticketService");
const emailService_1 = require("./emailService");
const initializePayment = async ({ eventId, userId, quantity, email, }) => {
    // 1. Validate event
    const event = await eventModel_1.Event.findById(eventId);
    if (!event) {
        throw new Error("Event not found");
    }
    if (event.ticketsSold + quantity > event.totalTickets) {
        throw new Error("Not enough tickets available");
    }
    // 2. Calculate amount (Paystack expects kobo)
    const amount = event.price * quantity * 100;
    // 3. Create payment record (PENDING)
    const reference = crypto_1.default.randomUUID();
    const payment = await paymentModel_1.Payment.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        eventId: event._id,
        quantity,
        amount: event.price * quantity,
        email,
        reference,
        status: "PENDING",
    });
    // 4. Initialize Paystack transaction
    const response = await axios_1.default.post(`${paystack_1.paystackConfig.baseUrl}/transaction/initialize`, {
        email,
        amount,
        reference,
        callback_url: paystack_1.paystackConfig.callback_url,
        metadata: {
            paymentId: payment._id.toString(),
            eventId: event._id.toString(),
        },
    }, { headers: paystack_1.paystackConfig.headers });
    return {
        authorizationUrl: response.data.data.authorization_url,
        reference,
    };
};
exports.initializePayment = initializePayment;
const handlePaystackWebhook = async ({ payload, signature, }) => {
    // 1️⃣ Verify signature (payload is RAW STRING)
    const hash = crypto_1.default
        .createHmac("sha512", paystack_1.paystackConfig.secretKey)
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
    const payment = await paymentModel_1.Payment.findOne({ reference });
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
    const event = await eventModel_1.Event.findById(metadata.eventId);
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
        tickets = await (0, ticketService_1.issueTicketsAfterPayment)({
            eventId: metadata.eventId,
            eventeeId: payment.userId.toString(),
            paymentRef: payment._id.toString(),
            quantity: payment.quantity,
        });
    }
    catch (err) {
        console.error("❌ Ticket issuance failed:", err);
        return;
    }
    console.log("🎟 Tickets created:", tickets.length);
    // 8️⃣ Send email
    await (0, emailService_1.sendTicketsEmail)({
        to: parsedPayload.data.customer.email,
        event,
        tickets,
        paymentId: payment._id.toString(),
    });
    console.log("📧 Ticket email sent");
};
exports.handlePaystackWebhook = handlePaystackWebhook;
