"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailConfig = exports.resend = void 0;
const resend_1 = require("resend");
const env_1 = require("./env");
const emailConfig = {
    appUrl: env_1.env.appUrl,
    frontendUrl: env_1.env.frontendUrl,
    resend: env_1.env.email.resend,
    EMAIL_FROM: env_1.env.email.from,
    ADMIN_EMAIL: env_1.env.email.admin_email,
};
exports.emailConfig = emailConfig;
const resend = new resend_1.Resend(emailConfig.resend);
exports.resend = resend;
