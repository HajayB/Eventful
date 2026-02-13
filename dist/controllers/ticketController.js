"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketQrController = exports.getMyTicketsController = exports.scanTicketController = void 0;
const ticketService_1 = require("../services/ticketService");
const ticketModel_1 = require("../models/ticketModel");
const mongoose_1 = __importDefault(require("mongoose"));
const ticketService_2 = require("../services/ticketService");
/**
 * CREATOR: Scan / verify ticket (QR)
 * POST /tickets/scan
 */
const scanTicketController = async (req, res) => {
    try {
        const creatorId = req.user.userId.toString();
        const { qrPayload, eventId } = req.body;
        if (!qrPayload || !eventId) {
            return res.status(400).json({
                valid: false,
                message: "qrPayload and eventId are required",
            });
        }
        const ticket = await (0, ticketService_2.scanTicket)({
            qrPayload,
            eventId,
            creatorId,
        });
        res.status(200).json({
            valid: true,
            status: "USED",
            message: "Ticket is valid and has been verified",
            ticketId: ticket._id,
            scannedAt: ticket.scannedAt,
        });
    }
    catch (error) {
        res.status(400).json({
            valid: false,
            message: error.message || "Invalid ticket",
        });
    }
};
exports.scanTicketController = scanTicketController;
/**
 * EVENTEE: View my tickets
 * GET /tickets/me?status=used|unused
 */
const getMyTicketsController = async (req, res) => {
    try {
        const eventeeId = req.user.userId.toString();
        const { status } = req.query;
        if (status && status !== "used" && status !== "unused") {
            return res.status(400).json({
                message: "Invalid status filter",
            });
        }
        const tickets = await (0, ticketService_1.getEventeeTickets)({
            eventeeId,
            status: status,
        });
        const response = tickets.map((ticket) => ({
            ...ticket,
            status: ticket.isScanned ? "USED" : "UNUSED",
            hasQr: !ticket.isScanned,
        }));
        res.status(200).json(response);
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Failed to fetch tickets",
        });
    }
};
exports.getMyTicketsController = getMyTicketsController;
const getTicketQrController = async (req, res) => {
    const eventeeId = req.user.userId;
    const ticketId = req.params.ticketId;
    if (!mongoose_1.default.Types.ObjectId.isValid(ticketId)) {
        return res.status(404).json({ message: "Ticket not found" });
    }
    const ticket = await ticketModel_1.Ticket.findOne({
        _id: ticketId,
        eventeeId, // 🔐 ensures ownership
    }).select("qrPayload isScanned");
    if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
    }
    if (ticket.isScanned) {
        return res.status(400).json({
            message: "Ticket already used",
        });
    }
    return res.json({
        qrPayload: ticket.qrPayload,
    });
};
exports.getTicketQrController = getTicketQrController;
