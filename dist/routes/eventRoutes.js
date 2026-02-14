"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const requireAuth_1 = require("../middlewares/requireAuth");
const requireCreator_1 = require("../middlewares/requireCreator");
const validateRequest_1 = require("../middlewares/validateRequest");
const eventValidation_1 = require("../validation/eventValidation");
const router = (0, express_1.Router)();
// Public
router.get("/", eventController_1.getAllEvents);
router.get("/:eventId", eventController_1.getSingleEvent);
router.get("/share/:eventId", eventController_1.shareEvent);
// Creator
router.post("/", requireAuth_1.requireAuth, requireCreator_1.requireCreator, (0, validateRequest_1.validateRequest)(eventValidation_1.createEventSchema), eventController_1.createEvent);
router.get("/creator/me", requireAuth_1.requireAuth, requireCreator_1.requireCreator, eventController_1.getCreatorEvents);
router.put("/:eventId", requireAuth_1.requireAuth, requireCreator_1.requireCreator, (0, validateRequest_1.validateRequest)(eventValidation_1.updateEventSchema), eventController_1.updateEvent);
router.delete("/:eventId", requireAuth_1.requireAuth, requireCreator_1.requireCreator, eventController_1.deleteEvent);
exports.default = router;
