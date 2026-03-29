"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPasswordResetToken = exports.generateResetPasswordToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
// src/utils/jwt.ts
const jwt = __importStar(require("jsonwebtoken"));
const env_1 = require("../config/env");
const signAccessToken = (payload) => {
    return jwt.sign(payload, env_1.env.jwt.accessSecret, { expiresIn: env_1.env.jwt.accessExpiresIn });
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (payload) => {
    return jwt.sign(payload, env_1.env.jwt.refreshSecret, { expiresIn: env_1.env.jwt.refreshExpiresIn });
};
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => {
    return jwt.verify(token, env_1.env.jwt.accessSecret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jwt.verify(token, env_1.env.jwt.refreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
// Generate reset password JWT
const generateResetPasswordToken = (payload) => {
    return jwt.sign({ id: payload.userId, email: payload.email }, env_1.env.email.resetSecret, { expiresIn: "1h" } // 1 hour
    );
};
exports.generateResetPasswordToken = generateResetPasswordToken;
// Verify RESET JWT
const verifyPasswordResetToken = (token) => {
    try {
        return jwt.verify(token, env_1.env.email.resetSecret);
    }
    catch (err) {
        throw new Error("Invalid or expired token");
    }
};
exports.verifyPasswordResetToken = verifyPasswordResetToken;
