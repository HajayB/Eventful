"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), ".env"),
});
exports.env = {
    appUrl: process.env.API_BASE_URL,
    frontendUrl: process.env.FRONTEND_BASE_URL,
    port: Number(process.env.PORT) || 4000,
    nodeEnv: process.env.NODE_ENV || "development",
    jwt: {
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
        accessSecret: process.env.ACCESS_SECRET,
        refreshSecret: process.env.REFRESH_SECRET,
    },
    mongodbUri: process.env.MONGO_URI,
    paystack: {
        baseUrl: process.env.PAYSTACK_BASE_URL,
        secretKey: process.env.PAYSTACK_SECRET_KEY,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY,
        paystack_callback_url: process.env.PAYSTACK_CALLBACK_URL,
        currency: "NGN",
    },
    email: {
        resend: process.env.RESEND_API_KEY,
        from: process.env.EMAIL_FROM,
        admin_email: process.env.ADMIN_EMAIL,
        verificationSecret: process.env.EMAIL_VERIFICATION_SECRET,
        resetSecret: process.env.EMAIL_RESET_SECRET,
    },
};
