"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const userModel_1 = require("../models/userModel");
const requireAuth = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        let decoded;
        try {
            decoded = (0, jwt_1.verifyAccessToken)(accessToken);
        }
        catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Access token expired" });
            }
            return res.status(401).json({ message: "Access token invalid" });
        }
        const user = await userModel_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }
        // Check if password was changed after token was issued
        if (user.passwordChangedAt && decoded.iat) {
            const passwordChangedTime = Math.floor(user.passwordChangedAt.getTime() / 1000);
            if (decoded.iat < passwordChangedTime) {
                return res.status(401).json({ message: "Password changed. Please log in again." });
            }
        }
        req.user = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ message: "Authentication failed" });
    }
};
exports.requireAuth = requireAuth;
