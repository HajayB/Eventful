"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    eventId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Event",
    },
    email: {
        type: String,
        required: true,
    },
    remindAt: {
        type: Date,
        required: true,
    },
    isSent: {
        type: Boolean,
        default: false,
    },
    sentAt: {
        type: Date,
    },
}, { timestamps: true });
exports.Notification = (0, mongoose_1.model)("Notification", notificationSchema);
