"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = exports.registerController = void 0;
const authService_1 = require("../services/authService");
/**
 * POST /auth/register
 */
const registerController = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const result = await (0, authService_1.registerUser)({
            name,
            email,
            password,
            role,
        });
        res.status(201).json(result);
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
        const result = await (0, authService_1.loginUser)({
            email,
            password,
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            message: error.message || "Invalid credentials",
        });
    }
};
exports.loginController = loginController;
