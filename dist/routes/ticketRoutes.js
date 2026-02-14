"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
const requireAuth_1 = require("../middlewares/requireAuth");
const requireCreator_1 = require("../middlewares/requireCreator");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Eventee: view eventee tickets
router.get("/me", requireAuth_1.requireAuth, ticketController_1.getMyTicketsController);
// Eventee: view ticket QR payload
router.get("/:ticketId/qr", requireAuth_1.requireAuth, (0, rateLimiter_1.createRateLimiter)({ windowMs: 60 * 1000, max: 5 }), ticketController_1.getTicketQrController);
// Creator: scan ticket
router.post("/scan", requireAuth_1.requireAuth, requireCreator_1.requireCreator, (0, rateLimiter_1.createRateLimiter)({ windowMs: 60 * 1000, max: 30 }), ticketController_1.scanTicketController);
exports.default = router;
