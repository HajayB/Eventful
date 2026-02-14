"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackConfig = void 0;
const env_1 = require("./env");
exports.paystackConfig = {
    baseUrl: env_1.env.paystack.baseUrl,
    secretKey: env_1.env.paystack.secretKey,
    publicKey: env_1.env.paystack.publicKey,
    callback_url: env_1.env.paystack.paystack_callback_url,
    headers: {
        Authorization: `Bearer ${env_1.env.paystack.secretKey}`,
        "Content-Type": "application/json",
    },
};
