"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventeeUnattendedEvents = exports.getEventeeAttendedEvents = exports.getEventeePaidEvents = exports.getCreatorPaymentAnalytics = exports.getCreatorEventAnalytics = exports.getCreatorAllTimeAnalytics = void 0;
const mongoose_1 = require("mongoose");
const eventModel_1 = require("../models/eventModel");
const ticketModel_1 = require("../models/ticketModel");
const paymentModel_1 = require("../models/paymentModel");
const cache_1 = require("../utils/cache");
//CREATOR ANALYTICS 
/**
 * CREATOR: All-time analytics
 */
const getCreatorAllTimeAnalytics = async (creatorId) => {
    const cacheKey = `analytics:creator:${creatorId}:all`;
    const cached = await (0, cache_1.getCache)(cacheKey);
    if (cached) {
        return cached;
    }
    const creatorObjectId = new mongoose_1.Types.ObjectId(creatorId);
    // 1. Fetch creator events
    const events = await eventModel_1.Event.find({ creatorId: creatorObjectId }, { _id: 1 });
    // 🚨 No events → return zeroed analytics
    if (events.length === 0) {
        const emptyResult = {
            totalTicketsSold: 0,
            totalRevenue: 0,
            totalAttendees: 0,
            totalUnusedTickets: 0,
        };
        await (0, cache_1.setCache)(cacheKey, emptyResult, 60);
        return emptyResult;
    }
    const eventIds = events.map((e) => e._id);
    // 2. Tickets sold + revenue
    const payments = await paymentModel_1.Payment.aggregate([
        { $match: { eventId: { $in: eventIds } } },
        {
            $group: {
                _id: null,
                totalTicketsSold: { $sum: "$quantity" },
                totalRevenue: { $sum: "$amount" },
            },
        },
    ]);
    // 3. Attendance (QR verified)
    const attendance = await ticketModel_1.Ticket.aggregate([
        {
            $match: {
                eventId: { $in: eventIds },
                isScanned: true,
            },
        },
        {
            $group: {
                _id: null,
                totalAttendees: { $sum: 1 },
            },
        },
    ]);
    const totalTicketsSold = payments[0]?.totalTicketsSold ?? 0;
    const totalAttendees = attendance[0]?.totalAttendees ?? 0;
    const result = {
        totalTicketsSold,
        totalRevenue: payments[0]?.totalRevenue ?? 0,
        totalAttendees,
        totalUnusedTickets: totalTicketsSold - totalAttendees,
    };
    await (0, cache_1.setCache)(cacheKey, result, 60);
    return result;
};
exports.getCreatorAllTimeAnalytics = getCreatorAllTimeAnalytics;
/**
 * CREATOR: Analytics Per Event
 */
const getCreatorEventAnalytics = async (creatorId, eventId) => {
    const cacheKey = `analytics:creator:${creatorId}:event:${eventId}`;
    const cached = await (0, cache_1.getCache)(cacheKey);
    if (cached) {
        return cached;
    }
    const event = await eventModel_1.Event.findOne({
        _id: eventId,
        creatorId,
    });
    if (!event) {
        throw new Error("Event not found or unauthorized");
    }
    const payments = await paymentModel_1.Payment.aggregate([
        { $match: { eventId: event._id } },
        {
            $group: {
                _id: null,
                ticketsSold: { $sum: "$quantity" },
                revenue: { $sum: "$amount" },
            },
        },
    ]);
    const qrVerified = await ticketModel_1.Ticket.countDocuments({
        eventId: event._id,
        isScanned: true,
    });
    const qrUnverified = await ticketModel_1.Ticket.countDocuments({
        eventId: event._id,
        isScanned: false,
    });
    const ticketsSold = payments[0]?.ticketsSold ?? 0;
    const result = {
        ticketsSold,
        revenue: payments[0]?.revenue ?? 0,
        qrVerified,
        qrUnverified: ticketsSold - qrVerified,
    };
    await (0, cache_1.setCache)(cacheKey, result, 60);
    return result;
};
exports.getCreatorEventAnalytics = getCreatorEventAnalytics;
//get the analytics for the payment on each event  
const getCreatorPaymentAnalytics = async ({ creatorId, }) => {
    // Find creator's events
    const events = await eventModel_1.Event.find({
        creatorId: new mongoose_1.Types.ObjectId(creatorId),
    }).select("_id title");
    if (!events.length) {
        return {
            totalRevenue: 0,
            totalPayments: 0,
            totalTicketsSold: 0,
            perEvent: [],
        };
    }
    const eventIds = events.map((e) => e._id);
    //Fetch successful payments
    const payments = await paymentModel_1.Payment.find({
        eventId: { $in: eventIds },
        status: "SUCCESS",
    });
    //Aggregate totals
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = payments.length;
    const totalTicketsSold = payments.reduce((sum, p) => sum + p.quantity, 0);
    //Per-event breakdown
    const perEvent = events.map((event) => {
        const eventPayments = payments.filter((p) => p.eventId.toString() === event._id.toString());
        return {
            eventId: event._id,
            title: event.title,
            revenue: eventPayments.reduce((sum, p) => sum + p.amount, 0),
            payments: eventPayments.length,
            ticketsSold: eventPayments.reduce((sum, p) => sum + p.quantity, 0),
        };
    });
    return {
        totalRevenue,
        totalPayments,
        totalTicketsSold,
        perEvent,
    };
};
exports.getCreatorPaymentAnalytics = getCreatorPaymentAnalytics;
/**
* EVENTEE: Events paid for
*/
const getEventeePaidEvents = async (eventeeId) => {
    return paymentModel_1.Payment.find({ userId: eventeeId }, {
        qrPayload: 0,
        paymentRef: 0,
        __v: 0,
    })
        .populate({
        path: "eventId",
        select: "title location startTime endTime price",
    })
        .sort({ createdAt: -1 });
};
exports.getEventeePaidEvents = getEventeePaidEvents;
/**
 * EVENTEE: Events attended (QR verified)
 */
const getEventeeAttendedEvents = async (eventeeId) => {
    return ticketModel_1.Ticket.find({
        eventeeId,
        isScanned: true,
    }, {
        qrPayload: 0,
        paymentRef: 0,
        __v: 0,
    })
        .populate({
        path: "eventId",
        select: "title location startTime endTime price",
    })
        .sort({ scannedAt: -1 });
};
exports.getEventeeAttendedEvents = getEventeeAttendedEvents;
/**
 * EVENTEE: Paid but not attended
 */
const getEventeeUnattendedEvents = async (eventeeId) => {
    return ticketModel_1.Ticket.find({
        eventeeId,
        isScanned: false,
    }, {
        qrPayload: 0,
        paymentRef: 0,
        __v: 0,
    }).populate({
        path: "eventId",
        select: "title location startTime endTime price",
    });
};
exports.getEventeeUnattendedEvents = getEventeeUnattendedEvents;
