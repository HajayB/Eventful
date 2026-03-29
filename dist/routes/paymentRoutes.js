"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const requireAuth_1 = require("../middlewares/requireAuth");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Eventee initializes payment
router.post("/initialize", requireAuth_1.requireAuth, (0, rateLimiter_1.createRateLimiter)({ windowMs: 60 * 1000, max: 5 }), paymentController_1.initializePaymentController);
// Paystack webhook (NO auth)
router.post("/webhook", paymentController_1.paystackWebhookController);
//POST /payments/:paymentId/resend-tickets
router.post("/resend-ticket/:paymentRef", requireAuth_1.requireAuth, (0, rateLimiter_1.createRateLimiter)({ windowMs: 60 * 1000, max: 2 }), paymentController_1.resendTickets);
// GET /payments/history
router.get("/history", requireAuth_1.requireAuth, paymentController_1.paymentHistoryController);
// Guest: no auth, rate limited
router.post("/guest/initialize", (0, rateLimiter_1.createRateLimiter)({ windowMs: 60 * 1000, max: 5 }), paymentController_1.guestInitializePaymentController);
router.post("/guest/resend", (0, rateLimiter_1.createRateLimiter)({ windowMs: 60 * 1000, max: 3 }), paymentController_1.guestResendTicketsController);
exports.default = router;
