"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_1 = require("./swagger");
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const reminderJob_1 = require("./jobs/reminderJob");
const app = (0, express_1.default)();
(0, swagger_1.setupSwagger)(app);
//Raw body ONLY for Paystack webhook
app.use("/api/payments/webhook", express_1.default.raw({ type: "application/json" }));
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
// Normal JSON for other routes
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Mount all routes under /api
app.use("/api", routes_1.default);
//for paystack call back 
app.use("/paystack/callback", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Payment confirmed. Your tickets are secured and a confirmation email is on its way.",
    });
});
(0, reminderJob_1.startReminderJob)();
app.use("/", (req, res) => {
    res.status(200).json({ message: "Server is running 🥶" });
});
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});
exports.default = app;
