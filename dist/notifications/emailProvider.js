"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const email_1 = require("../config/email");
const env_1 = require("../config/env");
const sendEmail = async ({ to, subject, html, }) => {
    await email_1.resend.emails.send({
        from: env_1.env.email.from,
        to,
        subject,
        html,
    });
};
exports.sendEmail = sendEmail;
