"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailLog = void 0;
const mongoose_1 = require("mongoose");
const emailLogSchema = new mongoose_1.Schema({
    to: { type: String, required: true },
    subject: { type: String, required: true },
    eventId: { type: mongoose_1.Types.ObjectId, ref: "Event" },
    paymentId: { type: mongoose_1.Types.ObjectId, ref: "Payment" },
    ticketIds: [{ type: mongoose_1.Types.ObjectId, ref: "Ticket" }],
    status: {
        type: String,
        enum: ["SENT", "FAILED"],
        default: "SENT",
    },
    error: String,
    sentAt: { type: Date, default: Date.now },
}, { timestamps: true });
exports.EmailLog = (0, mongoose_1.model)("EmailLog", emailLogSchema);
