"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendTickets = exports.paystackWebhookController = exports.guestResendTicketsController = exports.guestInitializePaymentController = exports.initializePaymentController = exports.paymentHistoryController = void 0;
const paymentService_1 = require("../services/paymentService");
const paymentHistoryService_1 = require("../services/paymentHistoryService");
const paymentModel_1 = require("../models/paymentModel");
const ticketModel_1 = require("../models/ticketModel");
const eventModel_1 = require("../models/eventModel");
const emailService_1 = require("../services/emailService");
// GET /payments/history
const paymentHistoryController = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const payments = await (0, paymentHistoryService_1.getUserPaymentHistory)(userId);
        return res.status(200).json({ payments });
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Failed to fetch payment history" });
    }
};
exports.paymentHistoryController = paymentHistoryController;
//initialize payment
const initializePaymentController = async (req, res) => {
    try {
        const { eventId, quantity, email } = req.body;
        const userId = req.user.userId.toString();
        const result = await (0, paymentService_1.initializePayment)({
            eventId,
            quantity,
            email,
            userId,
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Payment initialization failed",
        });
    }
};
exports.initializePaymentController = initializePaymentController;
// GUEST: initialize payment (no auth)
const guestInitializePaymentController = async (req, res) => {
    try {
        const { eventId, quantity, email } = req.body;
        const result = await (0, paymentService_1.initializeGuestPayment)({ eventId, quantity, email });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message || "Guest payment initialization failed" });
    }
};
exports.guestInitializePaymentController = guestInitializePaymentController;
// GUEST: resend tickets by email + reference (no auth)
const guestResendTicketsController = async (req, res) => {
    try {
        const { email, reference } = req.body;
        if (!email || !reference) {
            return res.status(400).json({ message: "Email and reference are required" });
        }
        const payment = await paymentModel_1.Payment.findOne({ reference, email: email.toLowerCase().trim(), status: "SUCCESS" });
        if (!payment) {
            return res.status(404).json({ message: "No paid ticket found for this email and reference" });
        }
        const tickets = await ticketModel_1.Ticket.find({ paymentRef: payment._id.toString() });
        if (!tickets.length) {
            return res.status(404).json({ message: "No tickets found" });
        }
        const event = await eventModel_1.Event.findById(payment.eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        await (0, emailService_1.sendGuestTicketsEmail)({
            to: payment.email,
            event,
            tickets,
            reference: payment.reference,
            paymentId: payment._id.toString(),
        });
        return res.json({ message: "Tickets resent successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Failed to resend tickets" });
    }
};
exports.guestResendTicketsController = guestResendTicketsController;
//PAYMENT WEBHOOKS
const paystackWebhookController = async (req, res) => {
    console.log("🔥 PAYSTACK WEBHOOK HIT");
    try {
        const signature = req.headers["x-paystack-signature"];
        if (!signature) {
            return res.status(400).json({ message: "Missing signature" });
        }
        await (0, paymentService_1.handlePaystackWebhook)({
            payload: req.body.toString(),
            signature,
        });
        console.log("✅ Webhook processed successfully");
        // Paystack requires 200 OK
        res.sendStatus(200);
    }
    catch (error) {
        // DO NOT expose errors to Paystack
        res.sendStatus(200);
    }
};
exports.paystackWebhookController = paystackWebhookController;
//resend ticket
const resendTickets = async (req, res) => {
    try {
        const { paymentRef } = req.params;
        const payment = await paymentModel_1.Payment.findOne({
            $or: [{ reference: paymentRef }, { _id: paymentRef }],
        });
        if (!payment || payment.status !== "SUCCESS") {
            return res.status(400).json({
                message: "Invalid or unpaid payment",
            });
        }
        const tickets = await ticketModel_1.Ticket.find({
            paymentRef: payment._id.toString(),
        });
        if (!tickets.length) {
            return res.status(404).json({
                message: "No tickets found for this payment",
            });
        }
        const event = await eventModel_1.Event.findById(payment.eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        await (0, emailService_1.sendTicketsEmail)({
            to: payment.email,
            event,
            tickets,
            paymentId: payment._id.toString(),
        });
        return res.json({
            message: "Tickets resent successfully",
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Failed to resend tickets" });
    }
};
exports.resendTickets = resendTickets;
