"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const requireAuth_1 = require("../middlewares/requireAuth");
const requireCreator_1 = require("../middlewares/requireCreator");
const router = (0, express_1.Router)();
// Creator analytics
router.get("/creator", requireAuth_1.requireAuth, requireCreator_1.requireCreator, analyticsController_1.creatorAllTimeAnalyticsController);
router.get("/creator/payments", requireAuth_1.requireAuth, requireCreator_1.requireCreator, analyticsController_1.creatorPaymentAnalytics);
router.get("/creator/:eventId", requireAuth_1.requireAuth, requireCreator_1.requireCreator, analyticsController_1.creatorEventAnalyticsController);
// Eventee analytics
router.get("/eventee/paid", requireAuth_1.requireAuth, analyticsController_1.eventeePaidEventsController);
router.get("/eventee/attended", requireAuth_1.requireAuth, analyticsController_1.eventeeAttendedEventsController);
router.get("/eventee/unattended", requireAuth_1.requireAuth, analyticsController_1.eventeeUnattendedEventsController);
exports.default = router;
