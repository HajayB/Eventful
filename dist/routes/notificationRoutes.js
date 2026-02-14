"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const requireAuth_1 = require("../middlewares/requireAuth");
const validateRequest_1 = require("../middlewares/validateRequest");
const notificationValidation_1 = require("../validation/notificationValidation");
const notificationService_1 = require("../services/notificationService");
const router = (0, express_1.Router)();
router.post("/reminder", requireAuth_1.requireAuth, (0, validateRequest_1.validateRequest)(notificationValidation_1.createReminderSchema), notificationController_1.createReminderController);
router.get("/reminder/me", requireAuth_1.requireAuth, notificationController_1.fetchUserReminders);
router.post("/internal/run-reminders", async (req, res) => {
    const secret = req.headers["x-cron-secret"];
    if (secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        await (0, notificationService_1.processPendingReminders)();
        return res.status(200).json({ message: "Reminders processed" });
    }
    catch (error) {
        console.error("Reminder execution failed", error);
        return res.status(500).json({ message: "Reminder job failed" });
    }
});
exports.default = router;
