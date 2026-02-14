"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendTickets = exports.paystackWebhookController = exports.initializePaymentController = void 0;
const paymentService_1 = require("../services/paymentService");
const paymentModel_1 = require("../models/paymentModel");
const ticketModel_1 = require("../models/ticketModel");
const eventModel_1 = require("../models/eventModel");
const emailService_1 = require("../services/emailService");
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
};
exports.resendTickets = resendTickets;
