"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCreator = void 0;
const requireCreator = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "CREATOR") {
        return res.status(403).json({ message: "Creator access required" });
    }
    next();
};
exports.requireCreator = requireCreator;
