"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventeeTickets = exports.scanTicket = exports.issueTicketsAfterPayment = void 0;
// src/services/ticketService.ts
const mongoose_1 = __importStar(require("mongoose"));
const ticketModel_1 = require("../models/ticketModel");
const eventModel_1 = require("../models/eventModel");
const crypto_1 = __importDefault(require("crypto"));
//TICKET CREATION
const issueTicketsAfterPayment = async ({ eventId, eventeeId, quantity, paymentRef, }) => {
    const session = await mongoose_1.default.startSession();
    try {
        return await session.withTransaction(async () => {
            //FIND EVENT 
            const event = await eventModel_1.Event.findById(eventId).session(session);
            if (!event)
                throw new Error("Event not found");
            // IDEMPOTENCY 
            const existingTickets = await ticketModel_1.Ticket.find({ paymentRef }).session(session);
            if (existingTickets.length === quantity) {
                return existingTickets;
            }
            // CAPACITY CHECK 
            if (event.ticketsSold + quantity > event.totalTickets) {
                throw new Error("Not enough tickets available");
            }
            // CREATE TICKETS 
            const ticketsPayload = Array.from({ length: quantity }).map(() => ({
                eventId: new mongoose_1.Types.ObjectId(eventId),
                eventeeId: eventeeId ? new mongoose_1.Types.ObjectId(eventeeId) : null,
                paymentRef,
                qrPayload: generateQrPayload(),
                isScanned: false,
            }));
            const createdTickets = await ticketModel_1.Ticket.insertMany(ticketsPayload, { session });
            // UPDATE EVENT 
            event.ticketsSold += quantity;
            await event.save({ session });
            return createdTickets;
        });
    }
    finally {
        session.endSession();
    }
};
exports.issueTicketsAfterPayment = issueTicketsAfterPayment;
const scanTicket = async ({ qrPayload, eventId, creatorId, }) => {
    // FIND TICKET + EVENT 
    const ticket = await ticketModel_1.Ticket.findOne({ qrPayload }).populate("eventId");
    if (!ticket)
        throw new Error("Invalid ticket");
    const event = ticket.eventId;
    // VALIDATIONS 
    if (event._id.toString() !== eventId) {
        throw new Error("Ticket does not belong to this event");
    }
    if (event.creatorId.toString() !== creatorId) {
        throw new Error("Unauthorized to scan this ticket");
    }
    if (ticket.isScanned) {
        throw new Error("Ticket already scanned");
    }
    /* -------- UPDATE -------- */
    ticket.isScanned = true;
    ticket.scannedAt = new Date();
    await ticket.save();
    return {
        id: ticket._id,
        eventId: ticket.eventId,
        scannedAt: ticket.scannedAt,
    };
};
exports.scanTicket = scanTicket;
const getEventeeTickets = async ({ eventeeId, status, }) => {
    const query = {
        eventeeId: new mongoose_1.Types.ObjectId(eventeeId),
    };
    if (status === "used")
        query.isScanned = true;
    if (status === "unused")
        query.isScanned = false;
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
/* ============================================================
   QR GENERATOR
============================================================ */
const generateQrPayload = () => {
    return crypto_1.default.randomBytes(32).toString("hex");
};
