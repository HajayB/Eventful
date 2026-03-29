"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaystackWebhook = exports.initializeGuestPayment = exports.initializePayment = void 0;
// src/services/paymentService.ts
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = require("mongoose");
const eventModel_1 = require("../models/eventModel");
const paymentModel_1 = require("../models/paymentModel");
const paystack_1 = require("../config/paystack");
const ticketService_1 = require("./ticketService");
const emailService_1 = require("./emailService");
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;
const initializePayment = async ({ eventId, userId, quantity, email, }) => {
    const event = await eventModel_1.Event.findById(eventId);
    if (!event)
        throw new Error("Event not found");
    if (event.ticketsSold + quantity > event.totalTickets) {
        throw new Error("Not enough tickets available");
    }
    if (quantity > event.maxTicketsPerPurchase) {
        throw new Error(`Maximum ${event.maxTicketsPerPurchase} tickets allowed per purchase`);
    }
    const amount = event.price * quantity * 100;
    const reference = crypto_1.default.randomUUID();
    const payment = await paymentModel_1.Payment.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        eventId: event._id,
        quantity,
        amount: event.price * quantity,
        email,
        reference,
        status: "PENDING",
        isGuest: false,
    });
    const response = await axios_1.default.post(`${paystack_1.paystackConfig.baseUrl}/transaction/initialize`, {
        email,
        amount,
        reference,
        callback_url: paystack_1.paystackConfig.callback_url,
        metadata: {
            paymentId: payment._id.toString(),
            eventId: event._id.toString(),
            isGuest: false,
        },
    }, { headers: paystack_1.paystackConfig.headers });
    return {
        authorizationUrl: response.data.data.authorization_url,
        reference,
    };
};
exports.initializePayment = initializePayment;
const initializeGuestPayment = async ({ eventId, quantity, email, }) => {
    const event = await eventModel_1.Event.findById(eventId);
    if (!event)
        throw new Error("Event not found");
    if (event.ticketsSold + quantity > event.totalTickets) {
        throw new Error("Not enough tickets available");
    }
    if (quantity > event.maxTicketsPerPurchase) {
        throw new Error(`Maximum ${event.maxTicketsPerPurchase} tickets allowed per purchase`);
    }
    const amount = event.price * quantity * 100;
    const reference = crypto_1.default.randomUUID();
    const payment = await paymentModel_1.Payment.create({
        eventId: event._id,
        quantity,
        amount: event.price * quantity,
        email,
        reference,
        status: "PENDING",
        isGuest: true,
    });
    const response = await axios_1.default.post(`${paystack_1.paystackConfig.baseUrl}/transaction/initialize`, {
        email,
        amount,
        reference,
        callback_url: `${FRONTEND_BASE_URL}/guest/callback`,
        metadata: {
            paymentId: payment._id.toString(),
            eventId: event._id.toString(),
            isGuest: true,
        },
    }, { headers: paystack_1.paystackConfig.headers });
    return {
        authorizationUrl: response.data.data.authorization_url,
        reference,
    };
};
exports.initializeGuestPayment = initializeGuestPayment;
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
    if (!metadata?.eventId) {
        console.log("❌ Missing eventId in metadata");
        return;
    }
    const event = await eventModel_1.Event.findById(metadata.eventId);
    if (!event) {
        console.log("❌ Event not found:", metadata.eventId);
        return;
    }
    // 7️⃣ Issue tickets — eventeeId is null for guests
    console.log("📦 Ticket quantity:", payment.quantity);
    let tickets;
    try {
        tickets = await (0, ticketService_1.issueTicketsAfterPayment)({
            eventId: metadata.eventId,
            eventeeId: payment.isGuest ? null : payment.userId?.toString() ?? null,
            paymentRef: payment._id.toString(),
            quantity: payment.quantity,
        });
    }
    catch (err) {
        console.error("❌ Ticket issuance failed:", err);
        return;
    }
    console.log("🎟 Tickets created:", tickets.length);
    // 8️⃣ Send email — different template for guests
    const customerEmail = parsedPayload.data.customer.email;
    if (payment.isGuest) {
        await (0, emailService_1.sendGuestTicketsEmail)({
            to: customerEmail,
            event,
            tickets,
            reference: payment.reference,
            paymentId: payment._id.toString(),
        });
    }
    else {
        await (0, emailService_1.sendTicketsEmail)({
            to: customerEmail,
            event,
            tickets,
            paymentId: payment._id.toString(),
        });
    }
    console.log("📧 Ticket email sent");
};
exports.handlePaystackWebhook = handlePaystackWebhook;
