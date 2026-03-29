"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.resetPasswordLink = exports.changePassword = exports.logoutUser = exports.rotateRefreshToken = exports.loginUser = exports.registerUser = exports.hashToken = void 0;
const userModel_1 = require("../models/userModel");
const refreshModel_1 = require("../models/refreshModel");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const crypto_1 = __importDefault(require("crypto"));
const emailService_1 = require("./emailService");
//blacklist used tokens for password reset to prevent reuse
const usedResetTokens = new Set();
const hashToken = (token) => {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
};
exports.hashToken = hashToken;
const registerUser = async ({ name, email, password, role = "EVENTEE", }) => {
    // 1. Check if user already exists
    const existingUser = await userModel_1.User.findOne({ email });
    if (existingUser) {
        throw new Error("User already exists");
    }
    // 2. Hash password
    const hashedPassword = await (0, password_1.hashPassword)(password);
    // 3. Create user
    const user = await userModel_1.User.create({
        name,
        email,
        password: hashedPassword,
        role,
    });
    // 4. Generate token
    const accessToken = (0, jwt_1.signAccessToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    const refreshToken = (0, jwt_1.signRefreshToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    await refreshModel_1.RefreshToken.create({
        tokenHash: (0, exports.hashToken)(refreshToken),
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const userObject = user.toObject();
    const { password: _, __v, ...safeUser } = userObject;
    return {
        user: safeUser,
        accessToken,
        refreshToken
    };
};
exports.registerUser = registerUser;
const loginUser = async ({ email, password, }) => {
    // 1. Find user
    const user = await userModel_1.User.findOne({ email });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    // 2. Compare password
    const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }
    // 3. Generate token
    const accessToken = (0, jwt_1.signAccessToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    const refreshToken = (0, jwt_1.signRefreshToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    const userObject = user.toObject();
    const { password: _, __v, ...safeUser } = userObject;
    await refreshModel_1.RefreshToken.create({
        tokenHash: (0, exports.hashToken)(refreshToken),
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: "", // optional
        ipAddress: "", // optional
    });
    return {
        user: safeUser,
        accessToken,
        refreshToken
    };
};
exports.loginUser = loginUser;
const rotateRefreshToken = async (refreshToken) => {
    const hashed = (0, exports.hashToken)(refreshToken);
    const existingToken = await refreshModel_1.RefreshToken.findOne({ tokenHash: hashed });
    if (!existingToken) {
        throw new Error("Invalid refresh token");
    }
    if (existingToken.revokedAt) {
        await refreshModel_1.RefreshToken.updateMany({ userId: existingToken.userId }, { revokedAt: new Date() });
        throw new Error("Suspicious activity detected. Please login again.");
    }
    if (existingToken.expiresAt < new Date()) {
        throw new Error("Token expired");
    }
    // verify token
    const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    const user = await userModel_1.User.findById(payload.userId);
    if (!user) {
        throw new Error("User not found");
    }
    const newRefreshToken = (0, jwt_1.signRefreshToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    existingToken.revokedAt = new Date();
    existingToken.replacedByTokenHash = (0, exports.hashToken)(newRefreshToken);
    await existingToken.save();
    await refreshModel_1.RefreshToken.create({
        tokenHash: (0, exports.hashToken)(newRefreshToken),
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const newAccessToken = (0, jwt_1.signAccessToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    return {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};
exports.rotateRefreshToken = rotateRefreshToken;
const logoutUser = async (refreshToken) => {
    const hashed = (0, exports.hashToken)(refreshToken);
    const token = await refreshModel_1.RefreshToken.findOne({ tokenHash: hashed });
    if (!token)
        return;
    token.revokedAt = new Date();
    await token.save();
};
exports.logoutUser = logoutUser;
const changePassword = async ({ userId, currentPassword, newPassword }) => {
    if (!currentPassword || !newPassword) {
        throw new Error("Current and new passwords are required");
    }
    const user = await userModel_1.User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const isPasswordValid = await (0, password_1.comparePassword)(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new Error("Current password is incorrect");
    }
    if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
    }
    if (currentPassword === newPassword) {
        throw new Error("New password cannot be the same as the old password");
    }
    const hashedNewPassword = await (0, password_1.hashPassword)(newPassword);
    user.password = hashedNewPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    return { message: "Password changed successfully" };
};
exports.changePassword = changePassword;
const resetPasswordLink = async ({ to }) => {
    // to is email address
    const user = await userModel_1.User.findOne({ email: to });
    if (!user) {
        return { message: "If this email exists, a reset link has been sent" };
    }
    const token = (0, jwt_1.generateResetPasswordToken)({ userId: user._id.toString(), email: user.email });
    await (0, emailService_1.resetPasswordEmail)({ to, token });
    return { message: "Reset email sent" };
};
exports.resetPasswordLink = resetPasswordLink;
const resetPassword = async ({ token, newPassword, confirmPassword }) => {
    if (!token) {
        throw new Error("Invalid or missing token");
    }
    if (usedResetTokens.has(token)) {
        throw new Error("Token has already been used");
    }
    const payload = (0, jwt_1.verifyPasswordResetToken)(token);
    if (!payload || !payload.email) {
        throw new Error("Token expired or invalid");
    }
    const email = payload.email;
    if (!newPassword || !confirmPassword) {
        throw new Error("New password and confirmPassword are required");
    }
    if (newPassword.length < 8) {
        throw new Error("Password is below 8 characters");
    }
    const user = await userModel_1.User.findOne({ email });
    if (!user) {
        throw new Error("User does not exist");
    }
    const isSame = await (0, password_1.comparePassword)(newPassword, user.password);
    if (isSame) {
        throw new Error("New password cannot be same as old password");
    }
    if (newPassword !== confirmPassword) {
        throw new Error("New password and confirm password don't match");
    }
    const hashedPassword = await (0, password_1.hashPassword)(newPassword);
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    usedResetTokens.add(token);
    return { message: "Password Reset Successfully" };
};
exports.resetPassword = resetPassword;
