"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventeeTickets = exports.scanTicket = exports.issueTicketsAfterPayment = void 0;
// src/services/ticketService.ts
const mongoose_1 = require("mongoose");
const ticketModel_1 = require("../models/ticketModel");
const eventModel_1 = require("../models/eventModel");
const crypto_1 = __importDefault(require("crypto"));
const issueTicketsAfterPayment = async ({ eventId, eventeeId, quantity, paymentRef, }) => {
    const event = await eventModel_1.Event.findById(eventId);
    if (!event) {
        throw new Error("Event not found");
    }
    //return existing tickets if already issued
    const existingTickets = await ticketModel_1.Ticket.find({ paymentRef });
    if (existingTickets.length > 0) {
        return existingTickets;
    }
    //Create tickets
    const tickets = Array.from({ length: quantity }).map(() => ({
        eventId: new mongoose_1.Types.ObjectId(eventId),
        eventeeId: new mongoose_1.Types.ObjectId(eventeeId),
        paymentRef,
        qrPayload: generateQrPayload(),
        isScanned: false,
    }));
    const createdTickets = await ticketModel_1.Ticket.insertMany(tickets);
    //Update tickets sold ONCE
    event.ticketsSold += quantity;
    await event.save();
    return createdTickets;
};
exports.issueTicketsAfterPayment = issueTicketsAfterPayment;
const scanTicket = async ({ qrPayload, eventId, creatorId, }) => {
    // 1. Find ticket
    const ticket = await ticketModel_1.Ticket.findOne({ qrPayload });
    if (!ticket) {
        throw new Error("Invalid ticket");
    }
    // 2. Check event match
    if (ticket.eventId.toString() !== eventId) {
        throw new Error("Ticket does not belong to this event");
    }
    // 3. Ensure event belongs to creator
    const event = await eventModel_1.Event.findById(eventId);
    if (!event || event.creatorId.toString() !== creatorId) {
        throw new Error("Unauthorized to scan this ticket");
    }
    // 4. Check if already scanned
    if (ticket.isScanned) {
        throw new Error("Ticket already scanned");
    }
    // 5. Mark as scanned
    ticket.isScanned = true;
    ticket.scannedAt = new Date();
    await ticket.save();
    return ticket;
};
exports.scanTicket = scanTicket;
const generateQrPayload = () => {
    return crypto_1.default.randomBytes(32).toString("hex");
};
const getEventeeTickets = async ({ eventeeId, status, }) => {
    const query = {
        eventeeId: new mongoose_1.Types.ObjectId(eventeeId),
    };
    if (status === "used") {
        query.isScanned = true;
    }
    if (status === "unused") {
        query.isScanned = false;
    }
    const tickets = await ticketModel_1.Ticket.find(query, {
        _id: 1,
        paymentRef: 1,
        createdAt: 1,
        isScanned: 1,
        eventId: 1,
    })
        .populate({
        path: "eventId",
        select: "title location startTime endTime price",
    })
        .sort({ createdAt: -1 })
        .lean();
    return tickets.map((ticket) => ({
        ...ticket,
        status: ticket.isScanned ? "USED" : "UNUSED",
        hasQr: !ticket.isScanned,
    }));
};
exports.getEventeeTickets = getEventeeTickets;
