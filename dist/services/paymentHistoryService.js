"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPaymentHistory = void 0;
const mongoose_1 = require("mongoose");
const paymentModel_1 = require("../models/paymentModel");
const getUserPaymentHistory = async (userId) => {
    const payments = await paymentModel_1.Payment.find({ userId: new mongoose_1.Types.ObjectId(userId) }, { __v: 0 })
        .populate({
        path: "eventId",
        select: "title location startTime",
    })
        .sort({ createdAt: -1 })
        .lean();
    return payments.map((p) => ({
        _id: p._id,
        amount: p.amount,
        quantity: p.quantity,
        reference: p.reference,
        status: p.status,
        paidAt: p.createdAt,
        event: {
            _id: p.eventId?._id,
            title: p.eventId?.title,
            location: p.eventId?.location,
            startTime: p.eventId?.startTime,
        },
    }));
};
exports.getUserPaymentHistory = getUserPaymentHistory;
