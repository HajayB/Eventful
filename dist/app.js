"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_1 = require("./swagger");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
(0, swagger_1.setupSwagger)(app);
app.set("trust proxy", 1);
//Raw body ONLY for Paystack webhook
app.use("/api/payments/webhook", express_1.default.raw({ type: "application/json" }));
// Normal JSON for other routes
app.use(express_1.default.json());
// Mount all routes under /api
app.use("/api", routes_1.default);
app.use("/", (req, res) => {
    res.status(200).json({ message: "Server is running 🥶" });
});
exports.default = app;
