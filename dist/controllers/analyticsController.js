"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventeeUnattendedEventsController = exports.eventeeAttendedEventsController = exports.eventeePaidEventsController = exports.creatorPaymentAnalytics = exports.creatorEventAnalyticsController = exports.creatorAllTimeAnalyticsController = void 0;
const analyticsService_1 = require("../services/analyticsService");
const analyticsService_2 = require("../services/analyticsService");
/**
 * CREATOR: All-time analytics
 * GET /analytics/creator
 */
const creatorAllTimeAnalyticsController = async (req, res) => {
    try {
        const creatorId = req.user.userId.toString();
        const analytics = await (0, analyticsService_1.getCreatorAllTimeAnalytics)(creatorId);
        res.status(200).json(analytics);
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Failed to fetch analytics",
        });
    }
};
exports.creatorAllTimeAnalyticsController = creatorAllTimeAnalyticsController;
/**
 * CREATOR: Per-event analytics
 * GET /analytics/creator/:eventId
 */
const creatorEventAnalyticsController = async (req, res) => {
    try {
        const creatorId = req.user.userId.toString();
        const eventId = req.params.eventId;
        const analytics = await (0, analyticsService_1.getCreatorEventAnalytics)(creatorId, eventId);
        res.status(200).json(analytics);
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Failed to fetch event analytics",
        });
    }
};
exports.creatorEventAnalyticsController = creatorEventAnalyticsController;
const creatorPaymentAnalytics = async (req, res) => {
    const creatorId = req.user.userId.toString();
    const analytics = await (0, analyticsService_2.getCreatorPaymentAnalytics)({
        creatorId,
    });
    res.json(analytics);
};
exports.creatorPaymentAnalytics = creatorPaymentAnalytics;
/**
 * EVENTEE: Events paid for
 * GET /analytics/eventee/paid
 */
const eventeePaidEventsController = async (req, res) => {
    try {
        const eventeeId = req.user.userId.toString();
        const events = await (0, analyticsService_1.getEventeePaidEvents)(eventeeId);
        res.status(200).json(events);
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Failed to fetch paid events",
        });
    }
};
exports.eventeePaidEventsController = eventeePaidEventsController;
/**
 * EVENTEE: Events attended (QR verified)
 * GET /analytics/eventee/attended
 */
const eventeeAttendedEventsController = async (req, res) => {
    try {
        const eventeeId = req.user.userId.toString();
        const events = await (0, analyticsService_1.getEventeeAttendedEvents)(eventeeId);
        res.status(200).json(events);
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Failed to fetch attended events",
        });
    }
};
exports.eventeeAttendedEventsController = eventeeAttendedEventsController;
/**
 * EVENTEE: Paid but not attended
 * GET /analytics/eventee/unattended
 */
const eventeeUnattendedEventsController = async (req, res) => {
    try {
        const eventeeId = req.user.userId.toString();
        const events = await (0, analyticsService_1.getEventeeUnattendedEvents)(eventeeId);
        res.status(200).json(events);
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Failed to fetch unattended events",
        });
    }
};
exports.eventeeUnattendedEventsController = eventeeUnattendedEventsController;
