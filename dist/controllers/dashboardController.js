"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventeeDashboard = exports.creatorDashboard = void 0;
const dashboardService_1 = require("../services/dashboardService");
const dashboardService_2 = require("../services/dashboardService");
const creatorDashboard = async (req, res) => {
    try {
        const creatorId = req.user.userId.toString();
        const dashboard = await (0, dashboardService_2.getCreatorDashboard)(creatorId);
        return res.status(200).json(dashboard);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message || "Failed to load dashboard",
        });
    }
};
exports.creatorDashboard = creatorDashboard;
const eventeeDashboard = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const dashboard = await (0, dashboardService_1.getEventeeDashboard)(userId);
        return res.status(200).json(dashboard);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message || "Failed to load dashboard",
        });
    }
};
exports.eventeeDashboard = eventeeDashboard;
