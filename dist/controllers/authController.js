"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordController = exports.sendResetLinkController = exports.changePasswordController = exports.logoutController = exports.refreshController = exports.loginController = exports.registerController = void 0;
const authService_1 = require("../services/authService");
/**
 * POST /auth/register
 */
const registerController = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const { user, accessToken, refreshToken } = await (0, authService_1.registerUser)({
            name,
            email,
            password,
            role,
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(201).json({ message: "User registered succesffuly", user: user });
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Registration failed",
        });
    }
};
exports.registerController = registerController;
/**
 * POST /auth/login
 */
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await (0, authService_1.loginUser)({
            email,
            password,
        });
        // 🍪 store tokens in cookies
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        // send user only
        res.status(200).json({
            message: "Login successful",
            user,
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Invalid credentials",
        });
    }
};
exports.loginController = loginController;
const refreshController = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }
        const result = await (0, authService_1.rotateRefreshToken)(refreshToken);
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.json({
            message: "Token refreshed successfully",
        });
    }
    catch (err) {
        res.status(401).json({ message: err.message });
    }
};
exports.refreshController = refreshController;
const logoutController = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await (0, authService_1.logoutUser)(refreshToken);
        }
        // clear cookies
        res.clearCookie("accessToken", {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        });
        // res.clearCookie("accessToken");
        // res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.logoutController = logoutController;
const changePasswordController = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const result = await (0, authService_1.changePassword)({
            userId: userId.toString(),
            currentPassword: req.body.currentPassword,
            newPassword: req.body.newPassword,
        });
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.changePasswordController = changePasswordController;
const sendResetLinkController = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await (0, authService_1.resetPasswordLink)({ to: email });
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.sendResetLinkController = sendResetLinkController;
const resetPasswordController = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        const result = await (0, authService_1.resetPassword)({
            token,
            newPassword,
            confirmPassword,
        });
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.resetPasswordController = resetPasswordController;
