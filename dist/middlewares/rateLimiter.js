"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = void 0;
// src/middlewares/rateLimiter.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const createRateLimiter = ({ windowMs, max, }) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req, res) => {
            res.status(429).json({
                message: "Too many requests, please try again later",
            });
        },
    });
};
exports.createRateLimiter = createRateLimiter;
